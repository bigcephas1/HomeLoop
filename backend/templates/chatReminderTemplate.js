const chatReminderTemplate = ({ name, unreadCount }) => {
  return `
    <div style="font-family: Arial;">
      <h2>Unread Messages</h2>

      <p>Hello ${name},</p>

      <p>You have ${unreadCount} unread messages on HomeLoop.</p>

      <p>Please check your inbox.</p>
    </div>
  `;
};

export default chatReminderTemplate;
