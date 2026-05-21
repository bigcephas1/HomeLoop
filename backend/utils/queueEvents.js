import { QueueEvents } from 'bullmq';

import redis from '../config/redis.js';

const notificationEvents = new QueueEvents('notifications', {
  connection: redis,
});

notificationEvents.on('completed', ({ jobId }) => {
  console.log(`✅ Notification job completed: ${jobId}`);
});

notificationEvents.on('failed', ({ jobId, failedReason }) => {
  console.log(`❌ Notification job failed: ${jobId}`);
  console.log(failedReason);
});

export default notificationEvents;
