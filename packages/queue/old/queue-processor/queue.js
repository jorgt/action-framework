import dotenv from 'dotenv';
import postgres from 'postgres';
import pino from 'pino';
import { Worker } from 'worker_threads';
import { queueAction } from '../schemas/schemas.js';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'dev'}` });

const PENDING_INTERVAL = process.env.PENDING_INTERVAL || 1000;
const RETRY_INTERVAL = process.env.RETRY_INTERVAL || 1000;
const DB_DATABASE = process.env.DB_DATABASE || 'actions_db';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || 'actions';
const DB_PASSWORD = process.env.DB_PASSWORD || 'actions_pwd';

// Logger Setup
const logger = pino({ name: `queue/processor/${Math.round(Math.random() * 9999999).toString(16)}` });
let currentProcessingEvent = null;

// PostgreSQL Client Setup with Connection Pooling
const sql = postgres({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  max: 10, // Adjust based on your requirements
  idle_timeout: 300, // Adjust idle timeout as needed
  connect_timeout: 30, // Adjust connect timeout as needed,
});

const EventStatus = {
  IN_PROCESS: 'IN PROCESS',
  PENDING: 'PENDING',
  PROCESSED: 'PROCESSED',
  ERROR: 'ERROR',
  FAILED: 'FAILED',
};

Object.freeze(EventStatus); // Ensure the enum is immutable

const MAX_RETRIES = 5; // Define the maximum number of retries

// Safe wrapper for async operations
const safeAsync =
  asyncFn =>
  async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      logger.error('SafeAsync: Error in async operation');
      logger.warn(error);
      throw error; // Propagate the error
    }
  };

// Safe Async Methods for SQL Operations
const updateQueueStatus = safeAsync(async (eventId, status, retries = null, start = new Date()) => {
  await sql`
    UPDATE event_queue
    SET status = ${status}, retries = ${retries}, updated_at = CURRENT_TIMESTAMP, start = ${start}
    WHERE id = ${eventId}::uuid
  `;
});

const actionLog = safeAsync(async (entity_id, entity_type, action_id) => {
  return await sql`
    insert into action_log (entity_id, entity_type, action_id)
    values (${entity_id}, ${entity_type}, ${action_id})
  `;
});

const getPendingEvent = safeAsync(async () => {
  return await sql`
    WITH updated AS (
      UPDATE event_queue
      SET status = ${EventStatus.IN_PROCESS}
      WHERE id = (
        SELECT id
        FROM event_queue
        WHERE status = ${EventStatus.PENDING}
        ORDER BY created_at
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, entity_id, entity_type, action, context, retries
    )
    SELECT id, entity_id, entity_type, action, context, retries
    FROM updated
  `;
});

const getRetryEvent = safeAsync(async () => {
  const now = new Date();
  return await sql`
    WITH updated AS (
      UPDATE event_queue
      SET status = ${EventStatus.IN_PROCESS}
      WHERE id = (
        SELECT id
        FROM event_queue
        WHERE status = ${EventStatus.ERROR} AND start <= ${now}
        ORDER BY created_at
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, entity_id, entity_type, action, context, retries
    )
    SELECT id, entity_id, entity_type, action, context, retries
    FROM updated
  `;
});

const processActionInWorker = event => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./src/queue-processor/action-worker.js', {
      workerData: event,
    });

    worker.on('message', message => {
      if (message.success) {
        resolve(message);
      } else {
        reject(new Error(message.error));
      }
    });

    worker.on('error', error => {
      reject(error);
    });

    worker.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

const updateEntityStatus = safeAsync(async (entityId, sequence, success) => {
  if(success) {
    await sql`
    UPDATE entity_status es
    SET status_code = s.code
    FROM sequences seq
    INNER JOIN statuses s ON seq.status_on_sequence_success = s.id
    WHERE es.entity_id = ${entityId}::uuid
    AND seq.id = ${sequence.sequence_id}::uuid;
  `;
  } else {
    await sql`
    UPDATE entity_status es
    SET status_code = s.code
    FROM sequences seq
    INNER JOIN statuses s ON seq.status_on_sequence_failure = s.id
    WHERE es.entity_id = ${entityId}::uuid
    AND seq.id = ${sequence.sequence_id}::uuid;
  `;
  }
});

const getNextAction = safeAsync(async (sequence_id, action_id) => {
  return await sql`
  SELECT a.id AS action_id, a.code AS action_code, a.type AS action_type, a.config, a.useraction, a.description AS action_description,
    sa.parent_action_id
  FROM sequence_actions AS sa
  INNER JOIN actions AS a ON sa.action_id = a.id
  WHERE sequence_id = ${sequence_id} 
    AND parent_action_id = ${action_id}
`;
});

const addEventToQueue = safeAsync(async (entity_id, entity_type, action, skip = false) => {
  const validationResult = queueAction.safeParse(action);
  if (!validationResult.success) {
    throw new Error('Invalid action data: ' + JSON.stringify(validationResult.error));
  }

  if (!skip) {
    const outstanding = await sql`
      SELECT id FROM event_lock WHERE entity_id = ${entity_id} AND entity_type = ${entity_type}
    `;
    if (outstanding.length > 0) throw Error(`Entity is locked: queue in progress for ${entity_type} ${entity_id}`);
  }

  await sql`
    INSERT INTO event_queue (entity_id, entity_type, action, status, retries)
    VALUES (${entity_id}::uuid, ${entity_type}, ${action}::jsonb, 'PENDING', 0)
  `;
  logger.info('Event added to queue');
});

const processEventQueue = safeAsync(async (getEventFunction) => {
  const result = await getEventFunction();

  if (result.length > 0) {
    const event = result[0];
    currentProcessingEvent = event;

    try {
      const action_result = await processActionInWorker(event);

      logger.info(`Processing event with result: ${action_result.success}`);

      const sequence = JSON.parse(event.action);
      const next = (await getNextAction(sequence.sequence_id, sequence.actions.action_id))[0];

      if (action_result.success) {
        if (next) {
          await addEventToQueue(event.entity_id, event.entity_type, { ...sequence, actions: next }, true);
        } else {
          await updateEntityStatus(event.entity_id, sequence, true);
        }

        await updateQueueStatus(event.id, EventStatus.PROCESSED);
        await actionLog(event.entity_id, event.entity_type, sequence.actions.action_id);

      } else {
        throw action_result.error;
      }

      logger.info(`Processed event ${event.id}`);
      currentProcessingEvent = null;
      return { success: true, timestamp: new Date(), data: next };
    } catch (e) {
      logger.error(`Error processing event ${event.id}:`, e);
      logger.warn(e);

      const retries = event.retries + 1;
      const retryDelay = Math.pow(2, retries - 1) * 60000; // Exponential backoff
      const nextStart = new Date(Date.now() + retryDelay);

      if (retries >= MAX_RETRIES) {
        await updateQueueStatus(event.id, EventStatus.FAILED, retries);
        await updateEntityStatus(event.entity_id, JSON.parse(event.action), false);
      } else {
        await updateQueueStatus(event.id, EventStatus.ERROR, retries, nextStart);
      }

      currentProcessingEvent = null;
      return { success: false, timestamp: new Date() };
    }
  }

  return { success: true, timestamp: new Date() };
});

// Function to listen to the database and process events
const listenToEvents = async () => {
  // Listen for notifications on the event_queue_insert channel
  sql.listen('event_queue_insert', async msg => {
    const payload = JSON.parse(msg);
    const { id, entity_id, entity_type, action, retries } = payload;
    logger.info(`Received notification for event ${id}`);
    try {
      await processEventQueue(getPendingEvent);
    } catch (error) {
      logger.error(`Listener: Error processing action for entity ${entity_id}:`);
      logger.trace(error);
    }
  });

  logger.info('Listening for events...');
};

const start = async () => {
  sql`update event_queue set status = ${EventStatus.PENDING} where status = ${EventStatus.IN_PROCESS}`;
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    await sql.end();
    process.exit();
  });

  process.on('SIGTERM', async () => {
    await sql.end();
    process.exit();
  });

  process.on('uncaughtException', async error => {
    logger.error('Uncaught Exception:');
    logger.trace(error);

    if (currentProcessingEvent) {
      await updateQueueStatus(currentProcessingEvent.id, EventStatus.FAILED);
    }
    // Optionally, restart the process or other recovery logic
  });

  process.on('unhandledRejection', async (reason, promise) => {
    logger.error('Unhandled Rejection at:' + promise);
    logger.trace(reason);

    if (currentProcessingEvent) {
      await updateQueueStatus(currentProcessingEvent.id, EventStatus.FAILED);
    }
    // Optionally, restart the process or other recovery logic
  });

  // Start listening to events
  listenToEvents();

  // Periodically check and process the event queue for pending events
  setInterval(() => processEventQueue(getPendingEvent), PENDING_INTERVAL); // Adjust the interval as needed

  // Periodically check and process the event queue for retry events
  setInterval(() => processEventQueue(getRetryEvent), RETRY_INTERVAL); // Adjust the interval as needed
};

start();
