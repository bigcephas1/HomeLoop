import { Worker } from 'bullmq';

import redis from '../config/redis.js';

import Notification from '../modules/notifications/notification.model.js';

const notificationWorker = new Worker(
  'notifications',

  async (job) => {
    const { user, title, message, type, link } = job.data;

    await Notification.create({
      user,
      title,
      message,
      type,
      link,
    });

    console.log(`🔔 Notification created for ${user}`);
  },

  {
    connection: redis,
  },
);

/////////////////////////////////////////////////////
// EVENTS
/////////////////////////////////////////////////////

notificationWorker.on('completed', (job) => {
  console.log(`✅ Notification job completed: ${job.id}`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`❌ Notification job failed: ${job?.id}`, err.message);
});

export default notificationWorker;
