import 'dotenv/config'
import ActionStateMachine from './stateMachine.js'
import logger from './utils/logger.js'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import db from './db.js'

let actionStateMachine
let fastifyServer

const API_KEY = process.env.API_KEY
if (!API_KEY) {
	throw new Error('INDEX|API: API_KEY environment variable is required')
}

// Initialize API server
async function initializeApiServer(processor) {
	try {
		const fastify = Fastify({
			logger: false,
		})

		// Add CORS support
		await fastify.register(cors, {
			origin: true,
		})

		// API key authentication
		fastify.addHook('onRequest', async (request, reply) => {
			const apiKey = request.headers['x-api-key']

			if (!apiKey || apiKey !== API_KEY) {
				reply.code(401).send({ error: 'INDEX|MIDDLEWARE: Invalid API key' })
			}
		})

		// Add job endpoint
		fastify.post('/enqueue', async (request, reply) => {
			const { tenant_id, entity_id, entity_type, sequence_code } = request.body

			if (!tenant_id || !entity_id || !entity_type || !sequence_code) {
				logger.error({ fields: request.body }, 'INDEX|ENQUEUE: Missing required fields')
				return reply.code(400).send({
					error: 'Missing required fields',
					required: ['entity_id', 'entity_type', 'sequence_code'],
				})
			}

			try {
				const jobData = await db('action_queue_initial_job')
					.where({
						entity_id,
						entity_type,
						sequence_code,
					})
					.first()

				const keys = [
					'entity_id',
					'entity_type',
					'current_status',
					'sequence_id',
					'sequence_code',
					'action_id',
					'action_code',
					'action_type',
					'config',
					'status_on_sequence_success',
					'status_on_sequence_failure',
				]

				keys.forEach((key) => {
					if (!jobData[key]) {
						throw new Error(`INDEX|ENQUEUE: Config incomplete: ${key}`)
					}
				})

				await processor.queue.add('action', {
					tenant_id,
					...jobData,
				})

				logger.info('INDEX|ENQUEUE: 1. Job enqueued')
				logger.debug({
					tenant_id,
					...jobData,
				})
				return { success: true }
			} catch (error) {
				logger.error({ error: error.message }, 'INDEX|ENQUEUE: 1. Failed to enqueue job')
				return reply.code(500).send({ error: 'INDEX|ENQUEUE: Failed to enqueue job' })
			}
		})

		// Health check endpoint
		fastify.get('/health', async () => {
			return { status: 'ok' }
		})

		const port = process.env.API_PORT
		if (!port) {
			throw new Error('INDEX|SERVER: API_PORT environment variable is required')
		}
		await fastify.listen({ port, host: '0.0.0.0' })
		logger.info(`INDEX|SERVER: API server listening on port ${port}`)

		return fastify
	} catch (error) {
		logger.error({ error }, 'INDEX|SERVER: Failed to initialize API server')
		throw error
	}
}

// Initialize state machine
async function initializeStateMachine() {
	try {
		actionStateMachine = new ActionStateMachine()
		logger.info('INDEX|INITIALIZE: Action state machine initialized')
		return actionStateMachine
	} catch (error) {
		logger.error('INDEX|INITIALIZE: Failed to initialize action state machine', {
			error: error.message,
		})
		throw error
	}
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
	logger.error('INDEX|PROCESS: Uncaught Exception', { error: error.message })
	shutdown(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
	logger.error('INDEX|PROCESS: Unhandled Rejection', { reason })
	shutdown(1)
})

// Graceful shutdown handler
async function shutdown(code = 0) {
	logger.info('INDEX|SHUTDOWN: Initiating graceful shutdown...')
	try {
		if (fastifyServer) {
			logger.info('INDEX|SHUTDOWN: Shutting down API server...')
			await fastifyServer.close()
		}
		if (actionStateMachine) {
			logger.info('INDEX|SHUTDOWN: Shutting down state machine...')
			await actionStateMachine.shutdown()
		}
	} catch (error) {
		logger.error('INDEX|SHUTDOWN: Error during shutdown', { error: error.message })
		code = 1
	} finally {
		logger.info('INDEX|SHUTDOWN: Shutdown complete')
		process.exit(code)
	}
}

// Handle termination signals
const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2']
signals.forEach((signal) => {
	process.on(signal, () => {
		logger.info(`INDEX|SIGNAL: Received ${signal}`)
		shutdown()
	})
})

// Start everything
logger.info('INDEX|START: Starting services...')
initializeStateMachine()
	.then(async (processor) => {
		fastifyServer = await initializeApiServer(processor)
		logger.info('INDEX|INITIALIZE: All services started successfully')
	})
	.catch((error) => {
		logger.error('INDEX|INITIALIZE: Failed to start', { error: error.message })
		process.exit(1)
	})
