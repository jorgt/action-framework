import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import ActionStateMachine from './stateMachine.js'
import logger from './utils/logger.js'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

let actionStateMachine

// Initialize state machine
async function initializeStateMachine() {
    try {
        actionStateMachine = new ActionStateMachine()
        logger.info('Action state machine initialized')
    } catch (error) {
        logger.error('Failed to initialize action state machine', { error: error.message })
        throw error
    }
}

// Basic routes
app.get('/', (req, res) => {
    res.json({ message: 'Action State Machine API' })
})

// Execute a sequence
app.post('/execute', async (req, res) => {
    try {
        const { entityId, entityType, sequenceId } = req.body

        if (!entityId || !entityType || !sequenceId) {
            return res.status(400).json({ 
                error: 'Missing required fields: entityId, entityType, and sequenceId are required' 
            })
        }

        const job = await actionStateMachine.executeSequence(entityId, entityType, sequenceId)
        res.json({ 
            message: 'Sequence execution queued',
            jobId: job.id
        })
    } catch (error) {
        logger.error('Error executing sequence', { error: error.message })
        res.status(500).json({ error: error.message })
    }
})

// Get available sequences for an entity
app.get('/sequences/:entityType/:entityId', async (req, res) => {
    try {
        const { entityId, entityType } = req.params
        const sequences = await actionStateMachine.getAvailableSequences(entityId, entityType)
        res.json(sequences)
    } catch (error) {
        logger.error('Error getting available sequences', { error: error.message })
        res.status(500).json({ error: error.message })
    }
})

// Get job status
app.get('/status/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params
        const status = await actionStateMachine.getJobStatus(jobId)
        res.json(status)
    } catch (error) {
        logger.error('Error getting job status', { error: error.message })
        res.status(500).json({ error: error.message })
    }
})

// Start the server
app.listen(port, async () => {
    console.log(`Server is running on port ${port}`)
    await initializeStateMachine()
})

// Handle shutdown
process.on('SIGTERM', async () => {
    logger.info('Shutting down...')
    if (actionStateMachine) {
        await actionStateMachine.shutdown()
    }
    process.exit(0)
})
