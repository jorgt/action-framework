import { WebSocketServer } from 'ws';
import fastifyPlugin from 'fastify-plugin';

const events = [
	'action_log_insert',
	'event_lock_insert',
	'event_lock_delete',
	'entity_status_update',
	'event_queue_update',
	'event_queue_insert',
];

async function socketPlugin(app, options) {
	const { db } = app.db;
	const log = app.log.child({ name: 'plugins/socket' });

	log.info('registering websocket');

	const allowedOrigins = ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:5174']; // Add your allowed origins here

	const wss = new WebSocketServer({ server: app.server });

	wss.on('connection', (socket, request) => {
		const origin = request.headers.origin;

		if (app.config.PRODUCTION) {
			if (!allowedOrigins.includes(origin)) {
				socket.close(1008, 'Origin not allowed'); // 1008: Policy Violation
				log.warn(`Connection from origin ${origin} rejected`);
				return;
			}
		}

		const sendMessage = (eventName, payload) => {
			socket.send(JSON.stringify({ event: eventName, data: payload }));
		};

		log.trace('Socket connected!', socket.id);
		events.forEach(e => db.listen(e, data => sendMessage(e, data)));

		// This needs expanding on. It is the only entry point for receiving web socket comms.
		socket.on('message', (message, data) => {
			const { event, payload } = JSON.parse(message + '');
			if (event === 'ping') {
				sendMessage('pong', { pong: true });
			}
			log.debug(`Received message: ${message}`);
		});

		socket.on('close', () => {
			log.debug('Client disconnected');
			// emitter.removeListener('entity_status_update', entityStatusUpdateHandler);
		});
	});

	app.decorate('ws', wss);
}

export default fastifyPlugin(socketPlugin);
