import emailQueue from '../queues/email.queue.js';

const addEmailJob = async ({ to, subject, html }) => {
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
      removeOnFail: false,
    },
  );
};

export default addEmailJob;
