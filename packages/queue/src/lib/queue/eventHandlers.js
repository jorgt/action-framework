import logger from '../../utils/logger.js'
import db from '../../db.js'
import { getProcessor } from '../../stateMachine.js'
import SocketServer from '../socketServer.js'

const updateEntityStatus = async (entityId, status) => {}
const updateLog = async (trx, data, returnvalue = {}, status_id) => {
	logger.warn('EVENT|COMPLETED: Updating log')
	// Perform the insert and get the inserted ID
	const [insertedLog] = await trx('action_log')
		.insert({
			entity_id: data.entity_id,
			entity_type: data.entity_type,
			action_id: data.action_id,
			payload: JSON.stringify({ key: 'value' }),
			result: JSON.stringify(returnvalue),
			status_id,
		})
		.returning(['id']) // Return the primary key (id) of the inserted row

	// Fetch the full details using a separate query
	const logEntry = await trx('action_log as al')
		.join('entities as e', 'e.id', 'al.entity_id')
		.join('action_actions as a', 'a.id', 'al.action_id')
		.join('action_statuses as s', 's.id', 'al.status_id')
		.select(
			'al.*',
			'e.name as entity_name',
			'a.name as action_name',
			'a.code as action_code',
			's.description as status_description',
			's.code as status_code'
		)
		.where('al.id', insertedLog.id) // Fetch details for the inserted record
		.first() // Get a single record
	SocketServer.getInstance().emitLog(logEntry)
}

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

		if (!returnvalue) {
			logger.error('EVENT|COMPLETED: Job failed, no return value')
			await updateLog(db, job.data, {})
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

				if (next) {
					const newJobData = { ...job.data, ...next }
					logger.info('EVENT|COMPLETED: Next action')
					const newJob = await queue.add('action', newJobData)

					// console.log('JOB', newJob)

					await updateLog(
						db,
						job.data,
						{ next: { status_changed: false, id: newJob.id, data: newJob.data }, ...returnvalue },
						job.data.status_on_sequence_success
					)
				} else {
					logger.info('EVENT|COMPLETED: Sequence completed, updating entity status')
					await getProcessor().releaseLock(job.data.entity_id)

					await db.transaction(async (trx) => {
						await db('action_entity_status')
							.where({
								entity_id: db.raw('?::uuid', [job.data.entity_id]),
								entity_type: job.data.entity_type,
							})
							.update({
								action_id: job.data.status_on_sequence_success,
								updated_at: db.fn.now(),
							})

						await updateLog(
							db,
							job.data,
							{ status_changed: true, ...returnvalue },
							job.data.status_on_sequence_success
						)
					})

					logger.warn('EVENT|COMPLETED: Entity updated')
				}
			} else {
				await db.transaction(async (trx) => {
					await db('action_entity_status')
						.where({
							entity_id: db.raw('?::uuid', [job.data.entity_id]),
							entity_type: job.data.entity_type,
						})
						.update({
							action_id: job.data.status_on_sequence_failure,
							updated_at: db.fn.now(),
						})

					await updateLog(
						db,
						job.data,
						{ status_changed: true, ...returnvalue },
						job.data.status_on_sequence_failure
					)
				})
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

			await db.transaction(async (trx) => {
				await db('action_entity_status')
					.where({
						entity_id: db.raw('?::uuid', [job.data.entity_id]),
						entity_type: job.data.entity_type,
					})
					.update({
						action_id: job.data.status_on_sequence_failure,
						updated_at: db.fn.now(),
					})

				await updateLog(trx, job.data, { error: failedReason }, job.data.status_on_sequence_failure)
			})
			await getProcessor().releaseLock(job.data.entity_id)
		} catch (error) {
			logger.error({ error, jobId, failedReason }, 'EVENT|FAILED: Error handling job failure')
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
