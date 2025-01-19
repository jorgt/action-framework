import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import config from './config.js'
import logger from './utils/logger.js'
import db from './db.js'

const LOCK_PREFIX = 'entity_lock:'

class ActionStateMachine {
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
            }
        })

        this.worker = new Worker('action-queue', this.processJob.bind(this), {
            connection: this.connection,
            concurrency: 10
        })

        this.setupListeners()
    }

    setupListeners() {
        this.worker.on('completed', async (job) => {
            logger.info(`Job ${job.id} completed`, { jobId: job.id })
            const { entityId, entityType, sequenceId } = job.data

            try {
                const sequence = await this.getSequence(sequenceId)
                if (sequence?.status_on_sequence_success) {
                    await this.updateEntityStatus(entityId, entityType, sequence.status_on_sequence_success)
                }
                await this.releaseLock(entityId, entityType)
            } catch (error) {
                logger.error('Error in job completion handler', { error: error.message, jobId: job.id })
            }
        })

        this.worker.on('failed', async (job, err) => {
            logger.error(`Job ${job.id} failed`, { jobId: job.id, error: err.message })
            const { entityId, entityType, sequenceId } = job.data

            try {
                const sequence = await this.getSequence(sequenceId)
                if (sequence?.status_on_sequence_failure) {
                    await this.updateEntityStatus(entityId, entityType, sequence.status_on_sequence_failure)
                }
                await this.releaseLock(entityId, entityType)
            } catch (error) {
                logger.error('Error in job failure handler', { error: error.message, jobId: job.id })
            }
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

    async acquireLock(entityId, entityType) {
        const lockKey = `${LOCK_PREFIX}${String(entityType)}:${String(entityId)}`
        const acquired = await this.connection.set(lockKey, '1', 'NX')
        if (!acquired) {
            throw new Error(`Entity is locked: ${entityType} ${entityId}`)
        }
    }

    async releaseLock(entityId, entityType) {
        const lockKey = `${LOCK_PREFIX}${String(entityType)}:${String(entityId)}`
        await this.connection.del(lockKey)
    }

    async getSequence(sequenceId) {
        try {
            const sequence = await db('action_sequences')
                .select([
                    'id',
                    'code',
                    'description',
                    'status_on_sequence_success',
                    'status_on_sequence_failure'
                ])
                .where({ id: sequenceId })
                .first()
            
            if (!sequence) {
                throw new Error(`Sequence ${sequenceId} not found`)
            }
            
            return sequence
        } catch (error) {
            logger.error('Failed to get sequence', { error: error.message, sequenceId })
            throw error
        }
    }

    async getAvailableSequences(entityId, entityType) {
        try {
            return await db.select('*')
                .from('action_available_sequences')
                .where({
                    entity_id: entityId,
                    entity_type: entityType
                })
        } catch (error) {
            logger.error('Failed to get available sequences', { 
                error: error.message, 
                entityId,
                entityType 
            })
            throw error
        }
    }

    async getSequenceActions(sequenceId) {
        try {
            return await db('action_sequence_actions as sa')
                .select([
                    'sa.id as sequence_action_id',
                    'a.id as action_id',
                    'a.code',
                    'a.type',
                    'a.config',
                    'sa.parent_action_id'
                ])
                .innerJoin('action_actions as a', 'sa.action_id', 'a.id')
                .where({ 'sa.sequence_id': sequenceId })
                .orderBy('sa.id')
        } catch (error) {
            logger.error('Failed to get sequence actions', { error: error.message, sequenceId })
            throw error
        }
    }

    async updateEntityStatus(entityId, entityType, statusUuid) {
        try {
            // First get the status code from the status UUID
            const status = await db('action_statuses')
                .select('code')
                .where({ id: statusUuid })
                .first()

            if (!status) {
                throw new Error(`Status not found for UUID: ${statusUuid}`)
            }

            // Then update the entity status
            await db('action_entity_status')
                .where({ 
                    entity_id: entityId,
                    entity_type: entityType 
                })
                .update({
                    status_code: status.code,
                    updated_at: db.fn.now()
                })
        } catch (error) {
            logger.error('Failed to update entity status', {
                error: error.message,
                entityId,
                entityType,
                statusUuid
            })
            throw error
        }
    }

    async processJob(job) {
        const { id, data } = job
        const { entityId, entityType, sequenceId } = data

        logger.info(`Processing job ${id}`, { entityId, entityType, sequenceId })

        try {
            // Get sequence actions
            const actions = await this.getSequenceActions(sequenceId)
            if (!actions.length) {
                throw new Error(`No actions found for sequence ${sequenceId}`)
            }

            // Execute actions in order
            for (const action of actions) {
                await this.executeAction(action, data)
            }

            return { success: true }
        } catch (error) {
            logger.error(`Error processing job ${id}`, { error: error.message })
            throw error
        }
    }

    async executeAction(action, jobData) {
        logger.info(`Executing action`, { 
            actionId: action.action_id, 
            type: action.type,
            code: action.code 
        })

        const config = typeof action.config === 'string' 
            ? JSON.parse(action.config) 
            : action.config

        switch (action.type) {
            case 'STATUS':
                await this.executeStatusAction(action, config, jobData)
                break
            case 'CODE':
                await this.executeCodeAction(action, config, jobData)
                break
            case 'CHECK':
                await this.executeCheckAction(action, config, jobData)
                break
            case 'CALL':
                await this.executeCallAction(action, config, jobData)
                break
            default:
                throw new Error(`Unknown action type: ${action.type}`)
        }
    }

    async executeStatusAction(action, config, jobData) {
        const { entityId, entityType } = jobData
        
        if (!config.status_id) {
            throw new Error('Status ID not specified in action config')
        }

        await this.updateEntityStatus(entityId, entityType, config.status_id)
    }

    async executeCodeAction(action, config, jobData) {
        logger.info('Executing code action', { config })
        // Execute based on config
    }

    async executeCheckAction(action, config, jobData) {
        logger.info('Executing check action', { config })
        // Execute based on config
    }

    async executeCallAction(action, config, jobData) {
        logger.info('Executing call action', { config })
        // Execute based on config
    }

    async executeSequence(entityId, entityType, sequenceId) {
        // Input validation
        if (!entityId || !entityType || !sequenceId) {
            throw new Error('Missing required parameters: entityId, entityType, and sequenceId are required')
        }

        // Acquire lock
        await this.acquireLock(entityId, entityType)

        // Validate sequence exists
        const sequence = await this.getSequence(sequenceId)
        if (!sequence) {
            throw new Error(`Invalid sequence ID: ${sequenceId}`)
        }

        // Add to queue
        return this.queue.add(
            'execute-sequence',
            {
                entityId,
                entityType,
                sequenceId,
                startedAt: new Date().toISOString()
            },
            {
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 60000,
                },
                removeOnComplete: false,
                removeOnFail: false,
            }
        )
    }

    async getJobStatus(jobId) {
        const job = await this.queue.getJob(jobId)
        if (!job) {
            throw new Error('Job not found')
        }
        return job
    }
}

export default ActionStateMachine