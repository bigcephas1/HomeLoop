import { Worker } from 'bullmq';

import redis from '../config/redis.js';

import { sendEmail } from '../services/email.service.js';

console.log('🚀 EMAIL WORKER STARTING...');

const emailWorker = new Worker(
  'emails',

  async (job) => {
    try {
      console.log('📨 EMAIL JOB RECEIVED');
      console.log(job.data);

      const { to, subject, html } = job.data;

      console.log(`📧 Sending email to ${to}`);

      await sendEmail({
        to,
        subject,
        html,
      });

      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.error('❌ EMAIL WORKER ERROR:', error);
      throw error;
    }
  },

  {
    connection: redis,
  },
);

/////////////////////////////////////////////////////
// EVENTS
/////////////////////////////////////////////////////

emailWorker.on('ready', () => {
  console.log('✅ EMAIL WORKER READY');
});

emailWorker.on('active', (job) => {
  console.log(`🔥 Processing email job ${job.id}`);
});

emailWorker.on('completed', (job) => {
  console.log(`✅ Email job completed: ${job.id}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job failed: ${job?.id}`);
  console.error(err);
});

emailWorker.on('error', (err) => {
  console.error('❌ EMAIL WORKER CONNECTION ERROR');
  console.error(err);
});

export default emailWorker;
