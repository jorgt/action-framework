import db from '../../db.js'
import logger from '../../utils/logger.js'

export async function getSequenceData(sequenceId) {
	try {
		// Use the view that already has all sequence data
		const sequence = await db('action_available_sequences')
			.where('sequence_id', db.raw('?::uuid', [sequenceId]))
			.first()

		if (!sequence) {
			logger.error('Sequence not found', { sequenceId })
			return null
		}

		return {
			id: sequence.sequence_id,
			code: sequence.sequence_code,
			description: sequence.sequence_description,
			status_on_sequence_success: sequence.status_on_sequence_success_id,
			status_on_sequence_failure: sequence.status_on_sequence_failure_id,
			success_status_code: sequence.status_on_sequence_success_code,
			failure_status_code: sequence.status_on_sequence_failure_code,
		}
	} catch (error) {
		logger.error('Error fetching sequence data', {
			error: error.message,
			sequenceId,
		})
		return null
	}
}

export async function getAvailableSequences(entityId, entityType) {
	try {
		const sequences = await db('action_available_sequences')
			.where({
				entity_id: db.raw('?::uuid', [entityId]),
				entity_type: entityType,
			})
			.select([
				'sequence_id',
				'sequence_code',
				'sequence_description',
				'status_on_sequence_success_code',
				'status_on_sequence_failure_code',
				'current_status_code',
			])

		return sequences
	} catch (error) {
		logger.error('Error fetching available sequences', {
			error: error.message,
			entityId,
			entityType,
		})
		return []
	}
}

export async function getRootActions(sequenceId) {
	try {
		const actions = await db('action_sequence_actions as sa')
			.select([
				'a.id as action_id',
				'a.code as action_code',
				'a.type as action_type',
				'a.config',
				'a.userAction',
				'a.description as action_description',
				'sa.parent_action_id',
				'sa.sequence_id',
				'sa.order',
				'sa.required',
				'sa.enabled',
				'at.name as type_name',
				'at.handler',
				'at.metadata as type_metadata',
			])
			.innerJoin('action_actions as a', 'sa.action_id', 'a.id')
			.leftJoin('action_types as at', 'a.type', 'at.code')
			.where({
				'sa.sequence_id': db.raw('?::uuid', [sequenceId]),
				'sa.parent_action_id': null,
			})
			.andWhere('sa.enabled', true)
			.orderBy('sa.order')

		return actions
	} catch (error) {
		logger.error('Error getting root actions', {
			error: error.message,
			sequenceId,
		})
		return []
	}
}

export async function getNextAction(sequenceId, parentActionId) {
	try {
		const actions = await db('action_sequence_actions as sa')
			.select([
				'a.id as action_id',
				'a.code as action_code',
				'a.type as action_type',
				'a.config',
				'a.userAction',
				'a.description as action_description',
				'sa.parent_action_id',
				'sa.sequence_id',
				'sa.order',
				'sa.required',
				'sa.enabled',
				'at.name as type_name',
				'at.handler',
				'at.metadata as type_metadata',
			])
			.innerJoin('action_actions as a', 'sa.action_id', 'a.id')
			.leftJoin('action_types as at', 'a.type', 'at.code')
			.where({
				'sa.sequence_id': db.raw('?::uuid', [sequenceId]),
				'sa.parent_action_id': db.raw('?::uuid', [parentActionId]),
			})
			.andWhere('sa.enabled', true)
			.orderBy('sa.order')

		return actions
	} catch (error) {
		logger.error('Error getting next action', {
			error: error.message,
			sequenceId,
			parentActionId,
		})
		return []
	}
}
