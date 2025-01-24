import fastifyPlugin from 'fastify-plugin';
import { verifyToken } from '../utils/tokens.js';
async function keycloakPlugin(app, options) {
	const log = app.log.child({ name: 'plugins/keycloak' });

	log.info('Registering session, cookies and setting up security handlers');

	app.addHook('preHandler', async (request, reply) => {
		try {
			// @ts-ignoren5Oy0w1LArkIENtC01lAb1GK1zKmEC8V
			const token = request.headers.authorization?.match(/^Bearer (.*)/)[1];
			if (!token) {
				reply.status(401).send('No token found');
				return;
			}

			const json = await verifyToken(token);

			if (!json) {
				reply.status(401).send('Unauthorized');
			}

			// @ts-ignore
			// request.session.set('user', json);
		} catch (err) {
			reply.status(401).send('Unauthorized');
		}
	});
}

export default fastifyPlugin(keycloakPlugin);
