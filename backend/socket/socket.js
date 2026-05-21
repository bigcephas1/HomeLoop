import { Server } from 'socket.io';

let io;

const connectedUsers = new Map();

/////////////////////////////////////////////////////
// INITIALIZE SOCKET
/////////////////////////////////////////////////////

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    /////////////////////////////////////////////////////
    // REGISTER USER
    /////////////////////////////////////////////////////

    socket.on('register', (userId) => {
      connectedUsers.set(userId.toString(), socket.id);

      console.log(`👤 User connected: ${userId}`);
    });

    /////////////////////////////////////////////////////
    // JOIN CONVERSATION
    /////////////////////////////////////////////////////

    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);

      console.log(`📦 Joined room: ${conversationId}`);
    });

    /////////////////////////////////////////////////////
    // SEND MESSAGE
    /////////////////////////////////////////////////////

    socket.on('sendMessage', (messageData) => {
      io.to(messageData.conversationId).emit('newMessage', messageData);
    });

    /////////////////////////////////////////////////////
    // TYPING
    /////////////////////////////////////////////////////

    socket.on('typing', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('userTyping', {
        userId,
      });
    });

    /////////////////////////////////////////////////////
    // STOP TYPING
    /////////////////////////////////////////////////////

    socket.on('stopTyping', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('userStoppedTyping', {
        userId,
      });
    });

    /////////////////////////////////////////////////////
    // DISCONNECT
    /////////////////////////////////////////////////////

    socket.on('disconnect', () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }

      console.log('❌ Socket disconnected:', socket.id);
    });
  });

  return io;
};

/////////////////////////////////////////////////////
// GET IO INSTANCE
/////////////////////////////////////////////////////

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  return io;
};

/////////////////////////////////////////////////////
// SEND REALTIME NOTIFICATION
/////////////////////////////////////////////////////

export const sendRealtimeNotification = (userId, notification) => {
  const socketId = connectedUsers.get(userId.toString());

  if (socketId && io) {
    io.to(socketId).emit('notification', notification);
  }
};
