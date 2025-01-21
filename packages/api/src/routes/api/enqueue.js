async function enqueueRoutes(app, options) {
	const { db } = app.db

	app.post('/enqueue', async (request, reply) => {
		const { sequenceId, entityId, entityType, actionType, actionParams } = request.body

		await db`
      INSERT INTO event_queue (sequence_id, entity_id, entity_type, action, action_params)
      VALUES (${sequenceId}, ${entityId}, ${entityType}, ${actionType}, ${actionParams})
    `

		reply.send({ status: 'enqueued' })
	})
}

export default enqueueRoutes
