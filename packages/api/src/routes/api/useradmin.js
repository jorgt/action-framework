import axios from 'axios';
import { getLogs } from '../../models/logs.js';
import { log, multipleSchema } from '../../schemas/schemas.js';

async function entitiesRoutes(app, options) {
	const { db } = app.db;

	const axios = require('axios');

	fastify.post('/signup', async (request, reply) => {
		const { tenantName, adminUsername, adminPassword } = request.body;

		try {
			const tokenResponse = await axios.post(
				'http://localhost:8080/auth/realms/master/protocol/openid-connect/token',
				new URLSearchParams({
					client_id: 'admin-cli',
					username: 'admin',
					password: 'admin',
					grant_type: 'password',
				}),
			);

			const accessToken = tokenResponse.data.access_token;

			// Create Realm
			await axios.post(
				'http://localhost:8080/auth/admin/realms',
				{
					realm: tenantName,
					enabled: true,
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			// Create Admin User
			await axios.post(
				`http://localhost:8080/auth/admin/realms/${tenantName}/users`,
				{
					username: adminUsername,
					enabled: true,
					credentials: [
						{
							type: 'password',
							value: adminPassword,
							temporary: false,
						},
					],
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			reply.send({ status: 'Tenant created successfully' });
		} catch (error) {
			reply.status(500).send({ error: 'Tenant creation failed', details: error.response.data });
		}
	});
}

export default entitiesRoutes;
