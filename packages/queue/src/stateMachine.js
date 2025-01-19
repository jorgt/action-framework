import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import config from './config.js'
import logger from './utils/logger.js'
import db from './db.js'

class ActionProcessor {
    constructor() {
        this.connection = new IORedis({ maxRetriesPerRequest: null })

        this.connection.on('error', (error) => {
            logger.error('Redis connection error:', error)
        })

        this.queue = new Queue('action-queue', { 
            connection: this.connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: false,
                removeOnFail: false
            }
        })

        this.worker = new Worker('action-queue', this.processAction.bind(this), {
            connection: this.connection,
            concurrency: 10
        })

        this.setupListeners()
    }

    setupListeners() {
        this.worker.on('completed', job => {
            logger.info(`Action completed`, { jobId: job.id })
        })

        this.worker.on('failed', (job, error) => {
            logger.error(`Action failed`, { jobId: job.id, error: error.message })
        })

        this.worker.on('error', error => {
            logger.error('Worker error:', error)
        })
    }

    async shutdown() {
        await this.worker.close()
        await this.queue.close()
        await this.connection.quit()
    }

    async getNextAction(sequenceId, parentActionId) {
        try {
            return await db('action_sequence_actions as sa')
                .select([
                    'a.id as action_id',
                    'a.code as action_code',
                    'a.type as action_type',
                    'a.config',
                    'a.userAction',
                    'a.description as action_description',
                    'sa.parent_action_id'
                ])
                .innerJoin('action_actions as a', 'sa.action_id', 'a.id')
                .where({ 
                    'sa.sequence_id': sequenceId,
                    'sa.parent_action_id': parentActionId
                })
        } catch (error) {
            logger.error('Error getting next action', { error: error.message })
            throw error
        }
    }

    async getRootActions(sequenceId) {
        try {
            return await db('action_sequence_actions as sa')
                .select([
                    'a.id as action_id',
                    'a.code as action_code',
                    'a.type as action_type',
                    'a.config',
                    'a.userAction',
                    'a.description as action_description',
                    'sa.parent_action_id'
                ])
                .innerJoin('action_actions as a', 'sa.action_id', 'a.id')
                .where({ 
                    'sa.sequence_id': sequenceId,
                    'sa.parent_action_id': null 
                })
        } catch (error) {
            logger.error('Error getting root actions', { error: error.message })
            throw error
        }
    }

    async updateEntityStatus(entityId, sequenceId, success) {
        try {
            const query = db('action_entity_status as es')
                .join('action_sequences as seq', 'seq.id', '=', sequenceId)
                .join(
                    'action_statuses as s',
                    's.id',
                    '=',
                    success ? 'seq.status_on_sequence_success' : 'seq.status_on_sequence_failure'
                )
                .where('es.entity_id', entityId)
                .update({
                    'es.status_code': db.raw('s.code'),
                    'es.updated_at': db.fn.now()
                })

            await query
        } catch (error) {
            logger.error('Error updating entity status', { error: error.message })
            throw error
        }
    }

    async queueAction(actionJob) {
        return this.queue.add('execute-action', actionJob, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            },
            removeOnComplete: false,
            removeOnFail: false
        })
    }

    async processAction(job) {
        const { actionData, entityId, entityType, sequenceId } = job.data
        
        logger.info(`Processing action`, { 
            actionId: actionData.action_id,
            type: actionData.action_type,
            code: actionData.action_code 
        })

        try {
            const config = typeof actionData.config === 'string' 
                ? JSON.parse(actionData.config) 
                : actionData.config

            // Execute current action
            switch (actionData.action_type) {
                case 'STATUS':
                    await this.executeStatusAction(actionData, config, job.data)
                    break
                case 'CODE':
                    await this.executeCodeAction(actionData, config, job.data)
                    break
                case 'CHECK':
                    await this.executeCheckAction(actionData, config, job.data)
                    break
                case 'CALL':
                    await this.executeCallAction(actionData, config, job.data)
                    break
                default:
                    throw new Error(`Unknown action type: ${actionData.action_type}`)
            }

            // Get next action(s) in sequence
            const nextActions = await this.getNextAction(sequenceId, actionData.action_id)
            
            if (nextActions?.length > 0) {
                // Queue next actions
                for (const nextAction of nextActions) {
                    await this.queueAction({
                        entityId,
                        entityType,
                        sequenceId,
                        actionId: nextAction.action_id,
                        actionData: nextAction
                    })
                }
                return { success: true, hasNext: true }
            } else {
                // No more actions, sequence completed successfully
                await this.updateEntityStatus(entityId, sequenceId, true)
                // Look for next sequences based on new status
                await this.queueNextAvailableSequences(entityId, entityType)
                return { success: true, hasNext: false }
            }

        } catch (error) {
            logger.error(`Error processing action`, { 
                error: error.message,
                actionId: actionData.action_id 
            })
            // Mark sequence as failed and update status
            await this.updateEntityStatus(entityId, sequenceId, false)
            throw error
        }
    }

    async executeStatusAction(action, config, jobData) {
        const { entityId, entityType } = jobData
        logger.info('Executing status action', { action, config })

        try {
            if (!config.status_id) {
                throw new Error('Status ID not specified in action config')
            }

            // Get status code from status_id
            const newStatus = await db('action_statuses')
                .where('id', config.status_id)
                .first()

            if (!newStatus) {
                throw new Error(`Invalid status_id in config: ${config.status_id}`)
            }

            // Update status
            await db('action_entity_status')
                .where({ 
                    entity_id: entityId,
                    entity_type: entityType 
                })
                .update({
                    status_code: newStatus.code,
                    updated_at: db.fn.now()
                })

            await this.logActionResult(action, jobData, {
                newStatus: newStatus.code,
                success: true
            })

            return true
        } catch (error) {
            await this.logActionResult(action, jobData, {
                error: error.message,
                success: false
            })
            throw error
        }
    }

    async executeCodeAction(action, config, jobData) {
        logger.info('Executing code action', { action, config })
        // Implementation needed
        return true
    }

    async executeCheckAction(action, config, jobData) {
        logger.info('Executing check action', { action, config })
        // Implementation needed
        return true
    }

    async executeCallAction(action, config, jobData) {
        logger.info('Executing call action', { action, config })
        // Implementation needed
        return true
    }

    async logActionResult(action, jobData, result) {
        const { entityId, entityType } = jobData
        
        try {
            await db('action_log').insert({
                entity_id: entityId,
                entity_type: entityType,
                action_id: action.action_id,
                payload: JSON.stringify(action.config || {}),
                result: JSON.stringify(result)
            })
        } catch (error) {
            logger.error('Failed to log action result', {
                error: error.message,
                action,
                result
            })
        }
    }

    async queueNextAvailableSequences(entityId, entityType) {
        try {
            const availableSequences = await db.select('*')
                .from('action_available_sequences')
                .where({
                    entity_id: entityId,
                    entity_type: entityType
                })
            
            for (const sequence of availableSequences) {
                const rootActions = await this.getRootActions(sequence.sequence_id)
                for (const action of rootActions) {
                    await this.queueAction({
                        entityId,
                        entityType,
                        sequenceId: sequence.sequence_id,
                        actionId: action.action_id,
                        actionData: action
                    })
                }
            }
        } catch (error) {
            logger.error('Error queuing next sequences', { error: error.message })
            throw error
        }
    }

    async startProcessing(entityId, entityType) {
        try {
            await this.queueNextAvailableSequences(entityId, entityType)
        } catch (error) {
            logger.error('Error starting processing', { error: error.message })
            throw error
        }
    }
}

export default ActionProcessor