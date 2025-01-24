// socket.js
import { io } from 'socket.io-client'

class SocketInstance {
  constructor() {
    if (SocketInstance.instance) {
      return SocketInstance.instance
    }

    this.socket = null
    this.lockCallbacks = new Map()
    this.globalLockCallbacks = new Set()
    this.logCallbacks = new Set()
    SocketInstance.instance = this
  }

  connect() {
    if (!this.socket) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3010'
      this.socket = io(apiUrl, {
        autoConnect: true,
        reconnection: true,
        extraHeaders: {
          'x-api-key': '7fdd999a-7cc3-46d8-91fb-c441bc69cba1',
        },
      })

      this.socket.on('connect', () => {
        console.debug('Socket connected')
      })

      this.socket.on('disconnect', () => {
        console.debug('Socket disconnected')
      })

      this.socket.on('lock:status', ({ entityId, locked }) => {
        const callbacks = this.lockCallbacks.get(entityId) || []
        callbacks.forEach((cb) => cb({ locked }))
        this.globalLockCallbacks.forEach((cb) => cb(entityId, { locked }))
      })

      this.socket.on('system:log', (logData) => {
        this.logCallbacks.forEach((cb) => cb(logData))
      })
    }
    return this
  }

  subscribeToEntityLock(entityId, callback) {
    if (!this.socket) {
      throw new Error('Socket not initialized. Call connect() first')
    }

    if (!this.lockCallbacks.has(entityId)) {
      this.lockCallbacks.set(entityId, new Set())
    }
    this.lockCallbacks.get(entityId).add(callback)

    return () => {
      const callbacks = this.lockCallbacks.get(entityId)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.lockCallbacks.delete(entityId)
        }
      }
    }
  }

  subscribeToAllLocks(callback) {
    if (!this.socket) {
      throw new Error('Socket not initialized. Call connect() first')
    }

    this.globalLockCallbacks.add(callback)
    return () => this.globalLockCallbacks.delete(callback)
  }

  subscribeToLogs(callback) {
    if (!this.socket) {
      throw new Error('Socket not initialized. Call connect() first')
    }

    this.logCallbacks.add(callback)
    return () => this.logCallbacks.delete(callback)
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.lockCallbacks.clear()
    this.globalLockCallbacks.clear()
    this.logCallbacks.clear()
  }
}

export const socketInstance = new SocketInstance()
export default socketInstance
