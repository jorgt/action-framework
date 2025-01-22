import logger from '../../utils/logger.js'

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
