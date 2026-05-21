import cron from 'node-cron';

import notificationQueue from '../queues/notification.queue.js';

/////////////////////////////////////////////////////
// RUN EVERY HOUR
/////////////////////////////////////////////////////

cron.schedule('0 * * * *', async () => {
  try {
    console.log('🕒 Running hourly cron job...');

    await notificationQueue.add(
      'hourly-cleanup',

      {
        title: 'System Cleanup',
        message: 'Hourly cleanup executed',
        type: 'system',
      },

      {
        attempts: 3,

        backoff: {
          type: 'exponential',
          delay: 5000,
        },

        removeOnComplete: true,
      },
    );

    console.log('✅ Cron job queued');
  } catch (error) {
    console.error('❌ Cron job failed:', error);
  }
});
