import { io } from 'socket.io-client'

class SocketInstance {
  constructor() {
    if (SocketInstance.instance) {
      return SocketInstance.instance
    }

    this.socket = null
    this.lockSpace = null
    this.lockCallbacks = new Map()
    this.globalLockCallbacks = new Set()
    SocketInstance.instance = this
  }

  connect() {
    if (!this.socket) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3010'
      this.socket = io(apiUrl)
      this.lockSpace = io(`${apiUrl}/locks`)

      this.lockSpace.on('connect', () => {
        console.debug('Lock namespace connected')
      })

      this.lockSpace.on('disconnect', () => {
        console.debug('Lock namespace disconnected')
      })

      // Single listener for all entity lock events
      this.lockSpace.onAny((event, status) => {
        if (event.startsWith('entity:')) {
          const entityId = event.split(':')[1]

          // Call entity-specific callbacks
          const callbacks = this.lockCallbacks.get(entityId) || []
          callbacks.forEach((cb) => cb(status))

          // Call global callbacks
          this.globalLockCallbacks.forEach((cb) => cb(entityId, status))
        }
      })
    }
    return this
  }

  // Subscribe to a specific entity
  subscribeToEntityLock(entityId, callback) {
    if (!this.lockSpace) {
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

  // Subscribe to all entity lock events
  subscribeToAllLocks(callback) {
    if (!this.lockSpace) {
      throw new Error('Socket not initialized. Call connect() first')
    }

    this.globalLockCallbacks.add(callback)
    return () => this.globalLockCallbacks.delete(callback)
  }

  disconnect() {
    if (this.lockSpace) {
      this.lockSpace.disconnect()
      this.lockSpace = null
    }
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.lockCallbacks.clear()
    this.globalLockCallbacks.clear()
  }
}

export const socketInstance = new SocketInstance()
export default socketInstance
