import { Worker } from 'bullmq';

import redis from '../config/redis.js';

import { sendEmail } from '../services/email.service.js';

const emailWorker = new Worker(
  'emails',

  async (job) => {
    const { to, subject, html } = job.data;

    console.log(`📧 Sending email to ${to}`);

    await sendEmail({
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}`);
  },

  {
    connection: redis,
  },
);

/////////////////////////////////////////////////////
// EVENTS
/////////////////////////////////////////////////////

emailWorker.on('completed', (job) => {
  console.log(`✅ Email job completed: ${job.id}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job failed: ${job?.id}`, err.message);
});

export default emailWorker;
