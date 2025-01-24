import { Queue, QueueEvents } from 'bullmq'
import IORedis from 'ioredis'
import db from './db.js'
import logger from './utils/logger.js'
import { setupQueueEvents, setupWorker } from './lib/index.js'
import SocketServer from './lib/socketServer.js'

const prefix = 'action-queue'
const QUEUE_NAME = 'entities'
const LOCK_PREFIX = 'entity_lock:'

class ActionProcessor {
	constructor() {
		this.connection = new IORedis({ maxRetriesPerRequest: null })

		this.queue = new Queue(QUEUE_NAME, {
			connection: this.connection,
			prefix,
			defaultJobOptions: {
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 1000,
				},
				removeOnComplete: false,
				removeOnFail: false,
			},
		})

		this.setupProcessor()
	}

	async acquireLock(entityId) {
		const lockKey = `${LOCK_PREFIX}${entityId}`
		const acquired = await this.connection.set(lockKey, '1', 'NX', 'EX', 3600) // 1 hour lock

		if (acquired) {
			SocketServer.getInstance().emitLockStatus(entityId, true)
			return true
		}
		return false
	}

	async releaseLock(entityId) {
		const lockKey = `${LOCK_PREFIX}${entityId}`
		await this.connection.del(lockKey)
		SocketServer.getInstance().emitLockStatus(entityId, false)
	}

	setupProcessor() {
		const queueEvents = new QueueEvents(QUEUE_NAME, {
			connection: this.connection,
			prefix,
		})

		setupQueueEvents(queueEvents, this.queue)
		this.worker = setupWorker(QUEUE_NAME, this.connection, prefix, db, this)
	}

	async shutdown() {
		await this.worker.close()
		await this.queue.close()
		await this.connection.quit()
	}
}

let instance = null

export function getProcessor() {
	if (!instance) {
		throw new Error('ActionProcessor not initialized')
	}
	return instance
}

export function initProcessor() {
	if (!instance) {
		instance = new ActionProcessor()
	}
	return instance
}

export default ActionProcessor
