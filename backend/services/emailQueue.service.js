import emailQueue from '../queues/email.queue.js';

export const queueEmail = async ({
  to,
  subject,
  html,
}) => {
  console.log('📥 ADDING EMAIL JOB');

  const job = await emailQueue.add(
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

  console.log('✅ EMAIL JOB ADDED:', job.id);
};
