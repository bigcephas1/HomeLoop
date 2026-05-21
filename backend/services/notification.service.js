import notificationQueue from '../queues/notification.queue.js';

const sendNotification = async ({
  user,
  title,
  message,
  type = 'system',
  link = '',
}) => {
  await notificationQueue.add(
    'send-notification',
    {
      user,
      title,
      message,
      type,
      link,
    },
    {
      attempts: 3,

      backoff: {
        type: 'exponential',
        delay: 3000,
      },

      removeOnComplete: true,
    },
  );
};

export default sendNotification;
