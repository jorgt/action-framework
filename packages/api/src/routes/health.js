export default async function health(fastify, options) {
	fastify.get('/health', async (request, reply) => {
		return { status: 'ok' };
	});
}
