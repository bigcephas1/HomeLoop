import nodemailer from 'nodemailer';

console.log(
  'EMAIL_USER defined?',
  !!process.env.EMAIL_USER,
);

console.log(
  'EMAIL_PASS defined?',
  !!process.env.EMAIL_PASS,
);

const transporter = nodemailer.createTransport({
  service: 'gmail',

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

///////////////////////////////////////////////////
///OPTIONAL SMTP CHECK
///////////////////////////////////////////////////

transporter.verify((error, success) => {
  if (error) {
    console.error(
      '❌ Nodemailer verification failed:',
      error.message,
    );

   return;
  }

  console.log('✅ Nodemailer ready');
});

///////////////////////////////////////////////////
///SEND EMAIL
///////////////////////////////////////////////////

export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    console.log(`📧 Attempting to send email to ${to}`);

    const info = await transporter.sendMail({
      from: `"HomeLoop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent:', info.messageId);

    return info;
  } catch (error) {
    console.error(
     '❌ SEND EMAIL ERROR:',
      error,
    );

   throw error;
  }
};



// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);


// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     console.log('📧 Sending via Resend to:', to);

//     const response = await resend.emails.send({
//       from: 'HomeLoop <onboarding@resend.dev>',
//       to,
//       subject,
//       html,
//     });

//     if (response.error) {
//       console.error('❌ RESEND ERROR:', response.error);
//       return;
//     }

//     console.log('✅ RESEND SUCCESS:', response.data);

//     return response;
//   } catch (err) {
//     console.error('❌ RESEND THROW ERROR:', err);
//     throw err;
//   }
// };
