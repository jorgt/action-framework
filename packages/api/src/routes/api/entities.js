import { getTestEntities, getTestEntity } from '../../models/entities.js';
import { executeSequenceOnEntity } from '../../models/actions.js';
import { entity, multipleSchema, singleSchema } from '../../schemas/schemas.js';

async function entitiesRoutes(app, options) {
  const { db } = app.db;
  const log = app.log.child({ name: 'routes/entities' });

  app.get('/entity/:id', { schema: { response: { 200: singleSchema(entity) } } }, async (request, reply) => {
    const { id } = request.params;
    // Fetch the entity by id from your data source
    const data = await getTestEntity(db, id);
    reply.send({
      success: true,
      data,
    });
  });

  app.post(
    '/entity/:id/sequence',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            sequence_code: { type: 'string' },
          },
          required: ['sequence_code'],
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { sequence_code } = request.body;

      try {
        await executeSequenceOnEntity(db, id, sequence_code);
        const data = await getTestEntity(db, id);
        reply.send({
          success: true,
          data: {},
        });
      } catch (error) {
        log.error(error);
        reply.status(500).send({ error: 'Internal Server Error' });
      }
    },
  );

  app.get('/entities', { schema: { response: { 200: multipleSchema(entity) } } }, async (request, reply) => {
    // Fetch all entities from your data source
    const data = await getTestEntities(db);
    reply.send({
      success: true,
      data,
    });
  });
}

export default entitiesRoutes;
