import axios from 'axios';
import { Engine } from 'json-rules-engine';

const definition = {
  type: 'CHECK',
  service: '2f4ef035-b5d2-474e-8180-f6603c170254',
  rules: [
    {
      fact: 'stock',
      operator: 'greaterThanInclusive',
      value: 2,
    },
  ],
};

export default async function process(db, action) {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
  // console.log(action);
  return true;
}

const checkAction = async (ID, action) => {
  const engine = new Engine();

  const { data } = await fetcher(action.service, { ID });

  definition.rules.forEach(rule => {
    engine.addRule({
      conditions: {
        any: [rule],
      },
      event: {
        type: rule.fact,
        params: {
          message: `Rule not met: ${rule.fact} ${rule.operator} ${rule.value}`,
        },
      },
    });
  });

  const { events, failureEvents } = await engine.run(data);

  // console.log(data, events, failureEvents);
  return {
    success: failureEvents.length === 0,
    message: events[0]?.params?.message || failureEvents[0]?.params?.message,
  };
};
