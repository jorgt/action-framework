import { Queue, QueueEvents } from 'bullmq'
import IORedis from 'ioredis'
import db from './db.js'
import logger from './utils/logger.js'
import {
	setupQueueEvents,
	setupWorker,
	buildEnhancedJobData,
	getAvailableSequences,
	getRootActions,
} from './lib/index.js'

const prefix = 'action-queue'
const QUEUE_NAME = 'entities'

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

	setupProcessor() {
		const queueEvents = new QueueEvents(QUEUE_NAME, {
			connection: this.connection,
			prefix,
		})

		setupQueueEvents(queueEvents, this.queue)
		this.worker = setupWorker(QUEUE_NAME, this.connection, prefix, db)
	}

	async shutdown() {
		await this.worker.close()
		await this.queue.close()
		await this.connection.quit()
	}
}

export default ActionProcessor
