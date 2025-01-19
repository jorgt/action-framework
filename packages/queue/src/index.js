import 'dotenv/config'
import ActionStateMachine from './stateMachine.js'
import logger from './utils/logger.js'

let actionStateMachine

// Initialize state machine
async function initializeStateMachine() {
	try {
		actionStateMachine = new ActionStateMachine()
		logger.info('Action state machine initialized')
		return actionStateMachine
	} catch (error) {
		logger.error('Failed to initialize action state machine', { error: error.message })
		throw error
	}
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
	logger.error('Uncaught Exception', { error: error.message })
	shutdown(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
	logger.error('Unhandled Rejection', { reason })
	shutdown(1)
})

// Graceful shutdown handler
async function shutdown(code = 0) {
	logger.info('Initiating graceful shutdown...')
	try {
		if (actionStateMachine) {
			logger.info('Shutting down state machine...')
			await actionStateMachine.shutdown()
		}
	} catch (error) {
		logger.error('Error during shutdown', { error: error.message })
		code = 1
	} finally {
		logger.info('Shutdown complete')
		process.exit(code)
	}
}

// Handle termination signals
const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2']
signals.forEach((signal) => {
	process.on(signal, () => {
		logger.info(`Received ${signal}`)
		shutdown()
	})
})

// Start the state machine
logger.info('Starting action state machine...')
initializeStateMachine().catch((error) => {
	logger.error('Failed to start', { error: error.message })
	process.exit(1)
})
