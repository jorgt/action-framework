import { Server } from 'socket.io'
import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'
import logger from '../utils/logger.js'

class SocketServer {
	constructor() {
		if (SocketServer.instance) {
			return SocketServer.instance
		}
		SocketServer.instance = this
		this.io = null
		this.pubClient = null
		this.subClient = null
	}

	async initialize(httpServer) {
		if (this.io) {
			return this
		}

		this.io = new Server(httpServer, {
			cors: {
				origin: true,
			},
		})

		this.pubClient = createClient({ url: process.env.REDIS_URL })
		this.subClient = this.pubClient.duplicate()

		await Promise.all([this.pubClient.connect(), this.subClient.connect()])

		this.io.adapter(createAdapter(this.pubClient, this.subClient))

		this.io.on('connection', (socket) => {
			logger.info('SOCKET|CONNECTION: Client connected')

			socket.on('disconnect', () => {
				logger.info('SOCKET|DISCONNECT: Client disconnected')
			})
		})

		return this
	}

	emitLockStatus(entityId, isLocked) {
		if (!this.io) {
			throw new Error('Socket server not initialized')
		}
		this.io.emit('lock:status', { entityId, locked: isLocked })
	}

	emitLog(log, message, meta = {}) {
		if (!this.io) {
			throw new Error('Socket server not initialized')
		}
		this.io.emit('system:log', {
			timestamp: new Date().toISOString(),
			log,
			message,
			meta,
		})
	}

	static getInstance() {
		if (!SocketServer.instance) {
			return new SocketServer()
		}
		return SocketServer.instance
	}

	async shutdown() {
		if (this.pubClient) {
			await this.pubClient.quit()
		}
		if (this.subClient) {
			await this.subClient.quit()
		}
		if (this.io) {
			await new Promise((resolve) => this.io.close(resolve))
		}
	}
}

export default SocketServer
