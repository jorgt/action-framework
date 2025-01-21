import logger from '../../utils/logger.js'
import { getEntityData } from '../database/entityQueries.js'
import { getAvailableSequences, getNextAction } from '../database/sequenceQueries.js'
import { actionHandlers } from '../actions/actionHandlers.js'

export async function buildEnhancedJobData(
	entityId,
	entityType,
	sequenceId,
	action,
	previousResults = []
) {
	try {
		if (!entityId || !entityType || !sequenceId || !action) {
			logger.error('Missing required parameters for job data', {
				entityId,
				entityType,
				sequenceId,
				actionId: action?.action_id,
			})
			return null
		}

		// Get all data upfront from the view that has everything pre-joined
		const [entityData, availableSequences, nextActions] = await Promise.all([
			getEntityData(entityId, entityType),
			getAvailableSequences(entityId, entityType),
			getNextAction(sequenceId, action.action_id),
		]).catch((error) => {
			logger.error('Failed to fetch required data', {
				error: error.message,
				stack: error.stack,
				entityId,
				entityType,
				sequenceId,
				actionId: action.action_id,
			})
			throw error
		})

		if (!entityData) {
			logger.error('Entity data not found', {
				entityId,
				entityType,
			})
			return null
		}

		// Find the current sequence in available sequences
		const currentSequence = availableSequences?.find((seq) => seq.sequence_id === sequenceId)

		if (!currentSequence) {
			logger.error('Sequence not available for entity', {
				entityId,
				entityType,
				sequenceId,
				availableSequences: availableSequences?.map((s) => s.sequence_id),
			})
			return null
		}

		// Validate action structure and required fields
		if (!action || typeof action !== 'object') {
			logger.error('Invalid action object', {
				entityId,
				entityType,
				sequenceId,
				action: action ? JSON.stringify(action) : 'null',
			})
			return null
		}

		// Validate action type before proceeding
		const availableTypes = Object.keys(actionHandlers)
		if (!action.action_type || !availableTypes.includes(action.action_type)) {
			logger.error('Invalid or unsupported action type', {
				entityId,
				entityType,
				sequenceId,
				actionId: action.action_id,
				actionType: action.action_type,
				availableTypes,
				action: JSON.stringify(action),
			})
			return null
		}

		// Validate action has required fields
		const requiredFields = ['action_id', 'action_code', 'action_type']
		const missingFields = requiredFields.filter((field) => !action[field])
		if (missingFields.length > 0) {
			logger.error('Action missing required fields', {
				entityId,
				entityType,
				sequenceId,
				actionId: action.action_id,
				missingFields,
				action: JSON.stringify(action),
			})
			return null
		}

		// Validate action config if present
		if (action.config) {
			try {
				// Ensure config is an object if it's a string
				if (typeof action.config === 'string') {
					JSON.parse(action.config)
				}
			} catch (error) {
				logger.error('Invalid action config JSON', {
					entityId,
					entityType,
					sequenceId,
					actionId: action.action_id,
					config: action.config,
					error: error.message,
				})
				return null
			}
		}

		return {
			// Basic identifiers
			entityId,
			entityType,
			sequenceId,
			actionId: action.action_id,
			actionData: action,

			// Enhanced data
			entity: {
				...entityData,
				metadata: entityData.metadata
					? typeof entityData.metadata === 'string'
						? JSON.parse(entityData.metadata)
						: entityData.metadata
					: {},
				statusHistory: entityData.status_history
					? typeof entityData.status_history === 'string'
						? JSON.parse(entityData.status_history)
						: entityData.status_history
					: [],
				createdAt: entityData.created_at,
				updatedAt: entityData.updated_at,
			},
			sequence: {
				id: currentSequence.sequence_id,
				code: currentSequence.sequence_code,
				description: currentSequence.sequence_description,
				statusOnSuccess: currentSequence.status_on_sequence_success_code,
				statusOnFailure: currentSequence.status_on_sequence_failure_code,
			},
			// Add context data to help with retries and status updates
			context: {
				currentStatus: currentSequence.current_status_code,
				availableSequences: availableSequences.map((seq) => ({
					id: seq.sequence_id,
					code: seq.sequence_code,
					statusOnSuccess: seq.status_on_sequence_success_code,
					statusOnFailure: seq.status_on_sequence_failure_code,
				})),
			},
			// Add action type metadata
			actionType: action.type_name
				? {
						name: action.type_name,
						handler: action.handler,
						metadata: action.type_metadata
							? typeof action.type_metadata === 'string'
								? JSON.parse(action.type_metadata)
								: action.type_metadata
							: {},
					}
				: null,
			nextActions,
			metadata: {
				startedAt: new Date().toISOString(),
				previousResults,
				retryCount: 0,
			},
		}
	} catch (error) {
		// Log error but don't throw to prevent crashes
		logger.error('Error building enhanced job data', {
			error: error.message,
			entityId,
			entityType,
			sequenceId,
			actionId: action.action_id,
		})
		return null
	}
}

export async function logActionResult(db, action, jobData, result) {
	const { entityId, entityType, metadata } = jobData

	try {
		await db('action_log').insert({
			entity_id: entityId,
			entity_type: entityType,
			action_id: action.action_id,
			payload: JSON.stringify(action.config || {}),
			result: JSON.stringify({
				...result,
				previousResults: metadata.previousResults,
			}),
		})
	} catch (error) {
		logger.error('Failed to log action result', {
			error: error.message,
			action,
			result,
		})
	}
}
