import fastifyPlugin from 'fastify-plugin';
import postgres from 'postgres';

/**
 * @param {FastifyInstance} fastify
 * @param {Object} options
 */
async function dbConnector(app, options) {
  const log = app.log.child({ name: 'plugins/db' });
  const dbConfig = {
    host: 'postgres',
    port: '5432',
    user: app.config.DB_USER,
    password: app.config.DB_PASSWORD,
    database: app.config.DB_DATABASE,
  };

  const newDb = () => {
    return postgres(dbConfig);
  };

  const db = postgres(dbConfig);

  // const result = await db`SELECT 1 AS connected`;

  // console.log(result);

  // // Define a test route to check the database connection
  // app.get('/api/db-test', async (request, reply) => {
  //   console.log('trying')
  //   try {
  //     const result = await db`SELECT 1 AS connected`;
  //     console.log('trying 2')
  //     reply.send({ success: true, data: result });
  //   } catch (error) {
  //     console.log('trying 3')
  //     app.log.error(error);
  //     reply.status(500).send({ success: false, error: 'Database connection failed' });
  //   }
  //   console.log('trying 4')
  // });

  app.decorate('db', {
    db,
    newDb,
    dbConfig,
    addEventToQueue: async (entityId, entityType, action, skip = false) => {
      if (!skip) {
        const outstanding = await db`select id from event_queue where entity_id = ${entityId} and entity_type = ${entityType} and action = 'PENDING'`;
        if (outstanding[0]) throw Error(`Entity is locked: queue in progress for ${entityType} ${entityId}`);
      }

      await db`
        insert into event_queue (entity_id, entity_type, action, status)
        values (${entityId}, ${entityType}, ${action}, 'PENDING')
      `;
      log.debug('Event added to queue');
    },
    setStatus: async (entityId, status) => {
      return await db`
      update entity_status es
      set status_code = s.code
      from sequences seq
      inner join statuses s on seq.status_on_sequence_success = s.id
      where es.entity_id = ${entityId}
        and seq.status_on_sequence_success = ${status};    
      `;
    },
  });

  app.addHook('onClose', async (app, done) => {
    await app.db.db.end();
    done();
  });
}

export default fastifyPlugin(dbConnector);
