import { Worker } from 'bullmq';

import redis from '../config/redis.js';

const chatWorker = new Worker(
  'chat',

  async (job) => {
    console.log('💬 Chat event processed:', job.data);
  },

  {
    connection: redis,
  },
);

/////////////////////////////////////////////////////
// EVENTS
/////////////////////////////////////////////////////

chatWorker.on('completed', (job) => {
  console.log(`✅ Chat job completed: ${job.id}`);
});

chatWorker.on('failed', (job, err) => {
  console.error(`❌ Chat job failed: ${job?.id}`, err.message);
});

export default chatWorker;
