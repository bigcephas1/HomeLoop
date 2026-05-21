const propertyApprovedTemplate = ({ name, propertyTitle }) => {
  return `
    <div style="font-family: Arial;">
      <h2>Property Approved</h2>

      <p>Hello ${name},</p>

      <p>Your property listing has been approved.</p>

      <p><strong>${propertyTitle}</strong> is now live.</p>

      <p>Congratulations 🎉</p>
    </div>
  `;
};

export default propertyApprovedTemplate;
