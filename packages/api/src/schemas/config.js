export default {
  type: 'object',
  required: ['NODE_ENV', 'PRODUCTION', 'PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'QUEUE_INTERVAL'],
  properties: {
    NODE_ENV: { type: 'string', default: 'development' },
    PRODUCTION: { type: 'boolean', default: false },
    PORT: { type: 'string', default: '5001' },
    DB_HOST: { type: 'string', default: 'localhost' },
    DB_PORT: { type: 'string', default: '5432' },
    DB_USER: { type: 'string', default: 'postgres' },
    DB_PASSWORD: { type: 'string', default: 'postgres' },
    DB_DATABASE: { type: 'string', default: 'postgres' },
    QUEUE_INTERVAL: { type: 'number', default: 1000 },
    FRONTEND_URL: { type: 'string', default: 'http://localhost:5173' },
    KEYCLOAK_URL: { type: 'string', default: 'http://localhost:8081/auth' },
    KEYCLOAK_REALM: { type: 'string', default: 'fastify' },
    KEYCLOAK_CLIENT_ID: { type: 'string', default: 'fastify' },
    KEYCLOAK_SECRET: { type: 'string', default: 'fastify_secret' },
    MAX_WORKERS: { type: 'number', default: 4 },
    // Add more environment variables as needed
  },
};
