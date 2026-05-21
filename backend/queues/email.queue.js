import { Queue } from 'bullmq';

import redis from '../config/redis.js';

const emailQueue = new Queue('emails', {
  connection: redis,
});

export default emailQueue;
