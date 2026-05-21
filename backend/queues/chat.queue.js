import { Queue } from 'bullmq';

import redis from '../config/redis.js';

const chatQueue = new Queue('chat', {
  connection: redis,
});

export default chatQueue;
