const refundProcessedTemplate = ({ name, amount }) => {
  return `
    <div style="font-family: Arial;">
      <h2>Refund Processed</h2>

      <p>Hello ${name},</p>

      <p>Your refund has been processed successfully.</p>

      <p><strong>Refund Amount:</strong> ₦${amount}</p>

      <p>Please allow a few business days for settlement.</p>
    </div>
  `;
};

export default refundProcessedTemplate;
