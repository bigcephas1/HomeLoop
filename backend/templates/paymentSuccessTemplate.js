const paymentSuccessTemplate = ({ name, amount, reference }) => {
  return `
    <div style="font-family: Arial;">
      <h2>Payment Successful</h2>

      <p>Hello ${name},</p>

      <p>Your payment was successful.</p>

      <ul>
        <li><strong>Amount:</strong> ₦${amount}</li>
        <li><strong>Reference:</strong> ${reference}</li>
      </ul>

      <p>Thank you for using HomeLoop.</p>
    </div>
  `;
};

export default paymentSuccessTemplate;
