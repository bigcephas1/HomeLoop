import nodemailer from 'nodemailer';

// Log env vars (remove after debugging)
console.log('EMAIL_USER defined?', !!process.env.EMAIL_USER);
console.log('EMAIL_PASS defined?', !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Nodemailer transporter error:', error);
  } else {
    console.log('✅ Nodemailer ready');
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  console.log(`📧 Attempting to send email to ${to}`);
  try {
    const info = await transporter.sendMail({
      from: `"HomeLoop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ sendEmail failed:', error);
    throw error; // important: rethrow so the controller can handle it
  }
};
