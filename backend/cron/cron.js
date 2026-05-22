import cron from 'node-cron';
import notificationQueue from '../queues/notification.queue.js';
import User from '../modules/users/user.model.js';

/////////////////////////////////////////////////////
// RUN EVERY HOUR
/////////////////////////////////////////////////////

cron.schedule('0 * * * *', async () => {
  try {
    console.log('🕒 Running hourly cron job...');

    // Get all users (because Notification.user is required)
    const users = await User.find({}, '_id');

    if (!users.length) {
      console.log('⚠️ No users found for notifications');
      return;
    }

    // Create a notification job for each user
    for (const user of users) {
      await notificationQueue.add(
        'hourly-cleanup',
        {
          user: user._id, // ✅ REQUIRED FIELD FIX
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
        }
      );
    }

    console.log(`✅ Cron job queued for ${users.length} users`);
  } catch (error) {
    console.error('❌ Cron job failed:', error);
  }
});
