import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'dev'}`});
import Fastify from 'fastify';
import fastifyEnv from '@fastify/env';
import fastifyCors from '@fastify/cors';
import config from './schemas/config.js';
import sockets from './plugins/sockets.js';
import keycloak from './plugins/keycloak.js';
import db from './plugins/db.js';
// import run from './queue/run.js';
import api from './routes/api/index.js';
import health from './routes/health.js';
import Ajv from "ajv"
import addFormats from "ajv-formats"

const ajv = new Ajv()
addFormats(ajv)

const PRODUCTION = process.env.NODE_ENV === 'production';
const TEST = process.env.NODE_ENV === 'test';
const FRONTEND_URL = process.env.FRONTEND_URL;
const options = {
  confKey: 'config', // optional, default: 'config'
  schema: config,
  dotenv: true, // load .env file
  data: process.env, // load environment variables
};

const app = Fastify({
  logger: {
    level: 'trace'
  },
});

app.setValidatorCompiler(({ schema }) => {
  const ajv = new Ajv({ allErrors: true, useDefaults: true });
  addFormats(ajv);
  return ajv.compile(schema);
});

app.addHook('preHandler', (request, reply, done) => {
  try {
    const token = request.headers.cookie.match(/token=([^=]+)/gi)[0].replace(/^token=/, '');
    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // console.log(e)
  }
  done();
});

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Realm', 'X-Requested-With'],
  credentials: true,
});

app.register(fastifyEnv, options).ready(err => {
  const log = app.log.child({ name: 'app' });
  if (err) log.error(err);

  log.info('Environment variables loaded');
});

app.register(keycloak);
app.register(db);
app.register(sockets);

api.forEach(r => {
  app.register(r, { prefix: '/api' });
  app.register(r, { prefix: '/api/v1' });
});

app.register(health);

export default app;
