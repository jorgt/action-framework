import { parentPort, workerData } from 'worker_threads';
import pino from 'pino';

const logger = pino({ name: `worker/${Math.round(Math.random() * 9999999).toString(16)}` });

const processAction = async (actionData) => {
  const { id, entity_id, action: action_data } = actionData;

  try {
    const parsed_action_data = JSON.parse(action_data);
    const {
      sequence_id,
      actions: { action_code },
    } = parsed_action_data;

    // Simulate processing with a timeout and random failure
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // if (Math.random() > 0.9) {
        //   reject(new Error('Processing failed'));
        // } else {
          resolve();
        // }
      }, Math.random() * 3000);
    });

    logger.info(`Processing action: ${action_code} for entity ${entity_id}`);
    parentPort.postMessage({ success: true, sequence_id, action_code });
  } catch (error) {
    logger.error(`Error processing action for entity ${entity_id}:`, error);
    logger.trace(error);
    parentPort.postMessage({ success: false, error: error.message });
  }
};

processAction(workerData);