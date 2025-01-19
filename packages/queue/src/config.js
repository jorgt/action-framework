import 'dotenv/config'

export default {
	redis: {
		host: process.env.REDIS_HOST || 'localhost',
		port: parseInt(process.env.REDIS_PORT || '6379'),
		password: process.env.REDIS_PASSWORD,
	},
	queues: {
		warranty: 'warranty-state-machine',
		dlq: 'warranty-state-machine-dlq',
	},
	states: {
		SUBMITTED: 'SUBMITTED',
		VALIDATING: 'VALIDATING',
		APPROVED: 'APPROVED',
		REJECTED: 'REJECTED',
		PROCESSING: 'PROCESSING',
		COMPLETED: 'COMPLETED',
		FAILED: 'FAILED',
	},
	transitions: {
		SUBMITTED: ['VALIDATING'],
		VALIDATING: ['APPROVED', 'REJECTED'],
		APPROVED: ['PROCESSING'],
		PROCESSING: ['COMPLETED', 'FAILED'],
		REJECTED: [],
		COMPLETED: [],
		FAILED: [],
	},
}
