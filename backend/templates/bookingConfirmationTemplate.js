const bookingConfirmationTemplate = ({
  name,
  propertyTitle,
  startDate,
  endDate,
  amount,
}) => {
  return `
    <div style="font-family: Arial;">
      <h2>Booking Confirmed</h2>

      <p>Hello ${name},</p>

      <p>Your booking has been confirmed.</p>

      <ul>
        <li><strong>Property:</strong> ${propertyTitle}</li>
        <li><strong>Start Date:</strong> ${startDate}</li>
        <li><strong>End Date:</strong> ${endDate}</li>
        <li><strong>Amount:</strong> ₦${amount}</li>
      </ul>

      <p>Thank you for using HomeLoop.</p>
    </div>
  `;
};

export default bookingConfirmationTemplate;
