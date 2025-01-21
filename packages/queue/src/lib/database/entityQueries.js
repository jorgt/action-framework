import db from '../../db.js'
import logger from '../../utils/logger.js'

export async function getEntityData(entityId, entityType) {
	try {
		// Get comprehensive entity data with status from the view
		const entityData = await db('action_available_sequences as aas')
			.select([
				'aas.entity_id',
				'aas.entity_type',
				'aas.current_status_code',
				'aas.current_status_description',
				'e.created_at',
				'e.updated_at',
				'e.metadata',
				'es.status_history',
			])
			.leftJoin('entities as e', function () {
				this.on('aas.entity_id', '=', 'e.id').andOn('aas.entity_type', '=', 'e.type')
			})
			.leftJoin('action_entity_status as es', 'aas.entity_id', 'es.entity_id')
			.where('aas.entity_id', db.raw('?::uuid', [entityId]))
			.andWhere('aas.entity_type', entityType)
			.first()

		if (!entityData) {
			// Fallback to direct entity lookup if not in view
			const entity = await db('entities as e')
				.select([
					'e.id as entity_id',
					'e.type as entity_type',
					'e.created_at',
					'e.updated_at',
					'e.metadata',
					'es.status_code as current_status_code',
					'es.status_history',
				])
				.leftJoin('action_entity_status as es', 'e.id', 'es.entity_id')
				.where({
					'e.id': db.raw('?::uuid', [entityId]),
					'e.type': entityType,
				})
				.first()

			if (!entity) {
				logger.error('Entity not found', {
					entityId,
					entityType,
				})
				return null
			}

			return {
				...entity,
				currentStatus: entity.current_status_code,
				statusDescription: null,
			}
		}

		return {
			...entityData,
			id: entityData.entity_id,
			currentStatus: entityData.current_status_code,
			statusDescription: entityData.current_status_description,
		}
	} catch (error) {
		// Log error but don't throw to prevent script crashes
		logger.error('Error fetching entity data', {
			error: error.message,
			entityId,
			entityType,
		})
		return null
	}
}

export async function updateEntityStatus(entityId, sequenceId, success) {
	try {
		// Get sequence info from the view that already has all status codes
		const sequence = await db('action_available_sequences')
			.where({
				entity_id: db.raw('?::uuid', [entityId]),
				sequence_id: db.raw('?::uuid', [sequenceId]),
			})
			.first()

		if (!sequence) {
			logger.error('Sequence not found or not available for entity', {
				entityId,
				sequenceId,
				success,
			})
			return
		}

		const statusCode = success
			? sequence.status_on_sequence_success_code
			: sequence.status_on_sequence_failure_code

		if (!statusCode) {
			logger.error('No status configured for sequence outcome', {
				entityId,
				sequenceId,
				success,
				currentStatus: sequence.current_status_code,
			})
			return
		}

		// Update entity status with the status code
		await db('action_entity_status')
			.where('entity_id', db.raw('?::uuid', [entityId]))
			.update({
				status_code: statusCode,
				updated_at: db.fn.now(),
			})

		logger.info('Entity status updated successfully', {
			entityId,
			sequenceId,
			previousStatus: sequence.current_status_code,
			newStatusCode: statusCode,
			success,
		})
	} catch (error) {
		// Log error but don't throw to prevent script crashes
		logger.error('Error updating entity status', {
			error: error.message,
			entityId,
			sequenceId,
			success,
		})
	}
}

export async function updateEntityStatusDirect(entityId, entityType, statusCode) {
	try {
		await db('action_entity_status')
			.where({
				entity_id: db.raw('?::uuid', [entityId]),
				entity_type: entityType,
			})
			.update({
				status_code: statusCode,
				updated_at: db.fn.now(),
			})

		logger.info('Entity status updated directly', {
			entityId,
			entityType,
			statusCode,
		})
	} catch (error) {
		// Log error but don't throw to prevent script crashes
		logger.error('Error directly updating entity status', {
			error: error.message,
			entityId,
			entityType,
			statusCode,
		})
	}
}
