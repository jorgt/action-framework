import { Worker } from 'bullmq'
import logger from '../../utils/logger.js'
import { actionHandlers } from '../actions/actionHandlers.js'

export function setupWorker(queueName, connection, prefix, db, processor) {
	const worker = new Worker(
		queueName,
		async (job) => {
			try {
				if (!job.data) {
					throw new Error('WORKER|SETUP: Job data is missing')
				}

				logger.info('WORKER|SETUP: 2. Processing action')

				const handler = actionHandlers[job.data.action_type]
				if (!handler) {
					throw new Error(`WORKER|SETUP: 2. Unknown action type: ${job.data.action_type}`)
				}

				const result = await handler(db, job.data)
				await processor.releaseLock(job.data.entity_id)
				return result

			} catch (error) {
				if (processor && job.data && job.data.entity_id) {
					await processor.releaseLock(job.data.entity_id)
				}
				logger.error({ error }, 'WORKER|SETUP: 2. Action execution failed')
				throw error
			}
		},
		{
			connection,
			concurrency: 10,
			prefix,
		}
	)

	worker.on('ready', () => {
		logger.info('WORKER|READY: Worker is ready and connected')
	})

	worker.on('error', (error) => {
		logger.error({ error }, 'WORKER|ERROR: Worker error:')
	})

	worker.on('closing', () => {
		logger.info('WORKER|CLOSING: Worker is closing')
	})

	worker.on('closed', () => {
		logger.info('WORKER|CLOSED: Worker has closed')
	})

	// Add connection event handlers
	connection.on('connect', () => {
		logger.info('WORKER|CONNECT: Redis connected')
	})

	connection.on('error', (error) => {
		logger.error({ error }, 'WORKER|ERROR: Redis connection error:')
	})

	logger.info('WORKER|START: Worker setup complete')

	return worker
}