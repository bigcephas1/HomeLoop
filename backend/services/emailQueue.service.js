import emailQueue from '../queues/email.queue.js';

export const queueEmail = async ({ to, subject, html }) => {
  await emailQueue.add(
    'send-email',
    {
      to,
      subject,
      html,
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
};
