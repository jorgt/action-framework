import { Server } from 'socket.io'
import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'
import logger from '../utils/logger.js'

export async function setupSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: true
    }
  })

  const pubClient = createClient({ url: process.env.REDIS_URL })
  const subClient = pubClient.duplicate()

  await Promise.all([pubClient.connect(), subClient.connect()])

  io.adapter(createAdapter(pubClient, subClient))

  const lockSpace = io.of('/locks')

  lockSpace.on('connection', (socket) => {
    logger.info('SOCKET|CONNECTION: Client connected')
  })

  return { io, pubClient, subClient }
}

export function emitLockStatus(io, entityId, isLocked) {
  io.of('/locks').emit(`entity:${entityId}`, { locked: isLocked })
}