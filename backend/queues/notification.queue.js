import { Queue } from 'bullmq';

import redis from '../config/redis.js';

const notificationQueue = new Queue('notifications', {
  connection: redis,
});

export default notificationQueue;
