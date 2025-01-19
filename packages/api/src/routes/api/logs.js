import { getLogs } from '../../models/logs.js';
import { log, multipleSchema } from '../../schemas/schemas.js';

async function entitiesRoutes(app, options) {
  const { db } = app.db;

  app.get('/logs', { schema: { response: { 200: multipleSchema(log) } } }, async (request, reply) => {
    // Fetch all entities from your data source
    const data = await getLogs(db);
    reply.send({
      success: true,
      data,
    });
  });
}

export default entitiesRoutes;
