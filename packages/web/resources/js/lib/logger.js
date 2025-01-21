import pino from 'pino';

const logger = pino({
  level: 'debug',
});

export default logger;
//One of 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'.
export const child = module => logger.child({ module });
