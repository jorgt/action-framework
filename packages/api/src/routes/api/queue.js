import { getQueue } from '../../models/queue.js';
import { queue, multipleSchema } from '../../schemas/schemas.js';


async function entitiesRoutes(app, options) {
  const { db } = app.db;

  app.get('/queues', { schema: { response: { 200: multipleSchema(queue) } } }, async (request, reply) => {
    // Fetch all entities from your data source
    try {
      const data = await getQueue(db);
      // console.log(JSON.stringify(data, null, 2));

      reply.send({
        success: true,
        data,
      });
    } catch (e) {
      console.log(e)
      throw new Error(e);
    }
  });
}

export default entitiesRoutes;
