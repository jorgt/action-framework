import server from './app.js';

const log = server.log.child({ name: 'index' });

server.after(err => {
	if (err) throw err;
	// Use ready hook to ensure the server is ready
	server.ready(err => {
		if (err) throw err;

		log.info('Server ready');

		// Call the start function or other post-initialization logic
		// if (process.env.NODE_ENV !== 'test') {
		start(server.config.PORT || 3004);
		// }
	});
});

/**
 * Run the server!
 */
const start = async port => {
	return new Promise((resolve, reject) => {
		try {
			server.listen({ port, host: '0.0.0.0' }, function (err, address) {
				if (err) {
					throw err;
				}
				resolve();
			});
		} catch (err) {
			log.error(err);
			server.db.db.end();
			process.exit(1);
			reject();
		}
	});
};

process.on('exit', () => server.db.db.end());

//for testing
export { server, start };
