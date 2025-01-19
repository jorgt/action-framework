import { getQueue } from '../../models/queue.js';
import { webhooks } from '../../schemas/schemas.js';

async function webhookRoutes(app, options) {
  const { db } = app.db;
  // Get all webhooks
  // Get all webhooks
  app.get(
    '/webhooks',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: webhooks,
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const webhooks = await db`select * from webhooks`;
        reply.send(webhooks);
      } catch (error) {
        reply.status(500).send({ status: 'error', message: error.message });
      }
    },
  );

  // Get one webhook by ID
  app.get(
    '/webhooks/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
        response: {
          200: webhooks,
          404: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const webhook = await db`select * from webhooks where id = ${id}`;
        if (webhook.length === 0) {
          reply.status(404).send({ status: 'error', message: 'Webhook not found' });
        } else {
          reply.send(webhook[0]);
        }
      } catch (error) {
        reply.status(500).send({ status: 'error', message: error.message });
      }
    },
  );

  // Create a new webhook
  app.post(
    '/webhooks',
    {
      schema: {
        body: webhooks,
        response: {
          200: webhooks,
          500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        },
      },
    },
    async (request, reply) => {
      const { headers, parameters, url, method, fields, name } = request.body;
      try {
        const webhook = await db`
      insert into webhooks (headers, parameters, url, method, fields, name)
      values (${headers}, ${parameters}, ${url}, ${method}, ${fields}, ${name})
      returning *
    `;
        reply.send(webhook[0]);
      } catch (error) {
        reply.status(500).send({ status: 'error', message: error.message });
      }
    },
  );

  // Update an existing webhook by ID
  app.put(
    '/webhooks/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
        body: webhooks,
        response: {
          200: webhooks,
          404: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
          500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { headers, parameters, url, method, fields, name } = request.body;
      try {
        const webhook = await db`
      update webhooks
      set headers = ${headers}, parameters = ${parameters}, url = ${url}, method = ${method}, fields = ${fields}, name = ${name}
      where id = ${id}
      returning *
    `;
        if (webhook.length === 0) {
          reply.status(404).send({ status: 'error', message: 'Webhook not found' });
        } else {
          reply.send(webhook[0]);
        }
      } catch (error) {
        reply.status(500).send({ status: 'error', message: error.message });
      }
    },
  );

  // Delete a webhook by ID
  app.delete(
    '/webhooks/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } },
        response: {
          200: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
          404: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
          500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const webhook = await db`
      delete from webhooks
      where id = ${id}
      returning *
    `;
        if (webhook.length === 0) {
          reply.status(404).send({ status: 'error', message: 'Webhook not found' });
        } else {
          reply.send({ status: 'success', message: 'Webhook deleted' });
        }
      } catch (error) {
        reply.status(500).send({ status: 'error', message: error.message });
      }
    },
  );
}

export default webhookRoutes;
