import pino from 'pino';
import pinoCaller from 'pino-caller';
import path from 'path';

const root = path.normalize(`${import.meta.url}../../..`);

const baseLogger = pino({
	level: process.env.LOG_LEVEL || 'info',
	formatters: {
		level: label => ({ level: label }),
	},
	timestamp: pino.stdTimeFunctions.isoTime,
});

const logger = pinoCaller(baseLogger, { relativeTo: root, stackAdjustment: 1 });

export default baseLogger;
