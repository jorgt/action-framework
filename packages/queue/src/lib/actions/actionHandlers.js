import logger from '../../utils/logger.js'
import { updateEntityStatusDirect } from '../database/entityQueries.js'
import { logActionResult } from '../queue/jobBuilder.js'

export async function executeStatusAction(db, action, config, jobData) {
	const { entity_id, entity_type, action_code } = jobData
	logger.info(
		{
			entity_id,
			entity_type,
			action_code,
		},
		'3. Executing status action'
	)

	return { success: true }

	// try {
	// 	if (!config.status_id) {
	// 		throw new Error('Status ID not specified in action config')
	// 	}

	// 	const newStatus = await db('action_statuses').where('id', config.status_id).first()

	// 	if (!newStatus) {
	// 		throw new Error(`Invalid status_id in config: ${config.status_id}`)
	// 	}

	// 	await updateEntityStatusDirect(entityId, entityType, newStatus.code)

	// 	const result = {
	// 		newStatus: newStatus.code,
	// 		previousStatus: entity.currentStatus,
	// 		timestamp: new Date().toISOString(),
	// 		success: true,
	// 		metadata: {
	// 			statusHistory: entity.statusHistory,
	// 			actionType: actionType?.name,
	// 			handler: actionType?.handler,
	// 		},
	// 	}

	// 	await logActionResult(db, action, jobData, result)

	// 	return { success: true, newStatus: newStatus.code }
	// } catch (error) {
	// 	const errorResult = {
	// 		error: error.message,
	// 		timestamp: new Date().toISOString(),
	// 		success: false,
	// 		context: {
	// 			currentStatus: entity.currentStatus,
	// 			statusHistory: entity.statusHistory,
	// 			actionType: actionType?.name,
	// 		},
	// 	}
	// 	await logActionResult(db, action, jobData, errorResult)
	// 	throw error
	// }
}

export async function executeCodeAction(db, data) {
	logger.info('3. Executing code action')
	// Implementation needed
	return { success: true }
}

export async function executeCheckAction(db, data) {
	logger.info('3. Executing check action')
	// Implementation needed
	return { success: true }
}

export async function executeCallAction(db, data) {
	logger.info('3. Executing call action')
	// Implementation needed
	return { success: true }
}

export const actionHandlers = {
	STATUS: executeStatusAction,
	CODE: executeCodeAction,
	CHECK: executeCheckAction,
	CALL: executeCallAction,
}
