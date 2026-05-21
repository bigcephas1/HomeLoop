// import Notification from '../modules/notifications/notification.model.js';

// const sendNotification = async ({
//   user,
//   title,
//   message,
//   type = 'system',
//   link = '',
// }) => {
//   return await Notification.create({
//     user,
//     title,
//     message,
//     type,
//     link,
//   });
// };

// export default sendNotification;

// import Notification from '../modules/notifications/notification.model.js';

// import { sendRealtimeNotification } from '../socket/socket.js';

// const sendNotification = async ({
//   user,
//   title,
//   message,
//   type = 'system',
//   link = '',
// }) => {
//   /////////////////////////////////////////////////////
//   // SAVE TO DATABASE
//   /////////////////////////////////////////////////////

//   const notification = await Notification.create({
//     user,
//     title,
//     message,
//     type,
//     link,
//   });

//   /////////////////////////////////////////////////////
//   // REALTIME PUSH
//   /////////////////////////////////////////////////////

//   sendRealtimeNotification(user, notification);

//   return notification;
// };

// export default sendNotification;

import notificationQueue from '../queues/notification.queue.js';

const sendNotification = async ({
  user,
  title,
  message,
  type = 'system',
  link = '',
}) => {
  await notificationQueue.add(
    'send-notification',
    {
      user,
      title,
      message,
      type,
      link,
    },
    {
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: false,
    },
  );
};

export default sendNotification;
