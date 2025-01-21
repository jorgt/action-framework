import logger from '../../utils/logger.js'
import db from '../../db.js'
import { updateEntityStatusDirect } from '../database/entityQueries.js'
import { buildEnhancedJobData } from './jobBuilder.js'
import { getRootActions } from '../database/sequenceQueries.js'

export function setupQueueEvents(queueEvents, queue) {
	queueEvents.on('waiting', ({ jobId }) => {
		logger.debug({ jobId }, 'EVENT|WAITING: Job waiting to start')
	})

	queueEvents.on('active', ({ jobId, prev }) => {
		logger.debug({ jobId, prevState: prev }, 'EVENT|ACTIVE: Job started processing')
	})

	queueEvents.on('completed', async ({ jobId, returnvalue }) => {
		logger.info({ jobId, returnvalue }, 'EVENT|COMPLETED: Job completed')
		const job = await queue.getJob(jobId)

		console.log(returnvalue)

		if (!returnvalue) {
			logger.error('EVENT|COMPLETED: Job failed, no return value')
		}

		try {
			if (returnvalue.success) {
				//next event or status update
				const next = await db('action_queue_child_actions')
					.where({
						parent_action_id: job.data.action_id,
						sequence_id: job.data.sequence_id,
					})
					.first()

				console.log(!!next)

				if (next) {
					const newJobData = { ...job.data, ...next }
					logger.info('EVENT|COMPLETED: Next action')
					queue.add('action', newJobData)
				} else {
					logger.info('EVENT|COMPLETED: Sequence completed, updating entity status')
					await db('action_entity_status')
						.where({
							entity_id: db.raw('?::uuid', [job.data.entity_id]),
							entity_type: job.data.entity_type,
						})
						.update({
							action_id: job.data.status_on_sequence_success,
							updated_at: db.fn.now(),
						})

					logger.warn('EVENT|COMPLETED: Entity updated')
				}
			} else {
				//failed status update
			}
		} catch (e) {
			console.error(e)
			logger.error({ error: e }, 'EVENT|COMPLETED: Error processing return value')
		}
	})

	queueEvents.on('failed', async ({ jobId, failedReason }) => {
		try {
			const job = await queue.getJob(jobId)
			if (!job) {
				logger.error({ jobId, failedReason }, 'EVENT|FAILED: Failed job not found')
				return
			}

			const errorDetails =
				typeof failedReason === 'object' ? failedReason : { message: failedReason }
		} catch (error) {
			logger.error(
				{
					error: error.message,
					stack: error.stack,
					jobId,
					failedReason,
				},
				'EVENT|FAILED: Error handling job failure'
			)
		}
	})

	queueEvents.on('stalled', ({ jobId }) => {
		logger.warn({ jobId }, 'EVENT|STALLED: Job stalled')
	})

	queueEvents.on('error', (error) => {
		logger.error(
			{
				message: error.message,
				stack: error.stack,
				code: error.code,
				timestamp: new Date().toISOString(),
			},
			'EVENT|ERROR: Queue event error'
		)
	})
}
