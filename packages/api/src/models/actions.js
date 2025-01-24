// @ts-nocheck
/**
 * Sets the status on an entity to a specific status code
 * @param {postgres} db The database instance * @param {uuid} entityId The entity ID
 * @param {uuid} statusId The status code
 * @returns
 */
export async function setStatus(db, entityId, statusId) {
	return await db`
  update entity_status es
  set status_code = s.code
  from sequences seq
  inner join statuses s on seq.status_on_sequence_success = s.id
  where es.entity_id = ${entityId}
    and seq.status_on_sequence_success = ${statusId};    
  `;
}

/**
 *
 * @param {postgres} db The database instance
 * @param {uuid} entityId
 * @param {string} entityType
 * @param {string} action
 * @param {boolean} skip
 */
export const addEventToQueue = async (db, entityId, entityType, action, skip = false) => {
	if (!skip) {
		const outstanding =
			await db`select id from event_queue where entity_id = ${entityId} and entity_type = ${entityType} and action = 'PENDING'`;
		if (outstanding[0]) throw Error(`Entity is locked: queue in progress for ${entityType} ${entityId}`);
	}

	await db`
    insert into event_queue (entity_id, entity_type, action, status)
    values (${entityId}, ${entityType}, ${db.json(action)}, 'PENDING')
  `;
};

/**
 * Returns a list of actions for a sequence on an entity
 *
 * @param {postgres} db The database instance
 * @param {uuid} entityId The entity ID
 * @param {string} sequenceCode The sequence code
 * @returns
 */
export async function getAvailableActions(db, entityId, sequenceCode) {
	return await db`
    select * 
    from available_actions_for_entity 
    where entity_id = ${entityId} 
    and sequence_code = ${sequenceCode}`;
}

/**
 * Gets the available sequences for an entity in its current status
 * @param {postgres} db
 * @param {uuid} entityId
 * @returns
 */
export async function getAvailableSequences(db, entityId) {
	return await db`select * from available_sequences_for_entity where entity_id = ${entityId}`;
}

export async function executeSequenceOnEntity(db, entityId, sequenceCode) {
	//get lock
	if (await isEventLocked(db, entityId, 'TEST'))
		throw Error(`Entity is locked: queue in progress for TEST ${entityId}`);
	const matrix = await db`
    select * 
    from available_actions_for_entity 
    where entity_id = ${entityId} 
    and sequence_code = ${sequenceCode}`;

	let sequence = matrix[0];

	if (!sequence) {
		throw new Error(`Sequence ${sequenceCode} not valid on entity ${entityId}`);
	}

	sequence.actions = sequence.actions.find(s => s.parent_action_id === null); // Find the first action in the sequence

	if (!sequence.actions) {
		throw new Error(`No valid start action found on ${sequenceCode} found for entity ${entityId}`);
	}

	await addEventToQueue(db, entityId, 'TEST', sequence);
}

export async function isEventLocked(db, entity_id, entity_type) {
	const res = await db`
    select * from event_lock 
    where entity_id = ${entity_id} 
    and entity_type = ${entity_type}
  `;

	return res.length > 0;
}
