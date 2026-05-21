const passwordResetTemplate = ({ name, resetUrl }) => {
  return `
    <div style="font-family: Arial;">
      <h2>Password Reset</h2>

      <p>Hello ${name},</p>

      <p>Click the link below to reset your password:</p>

      <a href="${resetUrl}">
        Reset Password
      </a>

      <p>This link expires in 15 minutes.</p>
    </div>
  `;
};

export default passwordResetTemplate;
