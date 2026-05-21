// import cookieParser from 'cookie-parser';
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve('backend/.env') });

// import userRoutes from './routes/userRoutes.js';
// import { notFound, errorHandler } from './middleware/error.middleWare.js';

// import connectDB from './db/connect.js';

// connectDB();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(cors());

// // routes
// app.use('/api', userRoutes);

// app.get('/', (req, res) => {
//   res.send('Welcome to HomeLoop API');
// });

// // ❗ MUST BE LAST
// app.use(notFound);
// app.use(errorHandler);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// import './config/env.js';

// import http from 'http';

// import app from './app.js';

// import connectDB from './config/db.js';

// import { initSocket } from './socket/socket.js';

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     /////////////////////////////////////////////////////
//     // CONNECT DATABASE
//     /////////////////////////////////////////////////////

//     await connectDB();

//     /////////////////////////////////////////////////////
//     // CREATE HTTP SERVER
//     /////////////////////////////////////////////////////

//     const server = http.createServer(app);

//     /////////////////////////////////////////////////////
//     // INITIALIZE SOCKET.IO
//     /////////////////////////////////////////////////////

//     initSocket(server);

//     /////////////////////////////////////////////////////
//     // START SERVER
//     /////////////////////////////////////////////////////

//     server.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };

// startServer();

import './config/env.js';

import http from 'http';

import app from './app.js';

import connectDB from './config/db.js';

import { initSocket } from './socket/socket.js';

import './workers/notification.worker.js';
import './workers/email.worker.js';
import './workers/chat.worker.js';
import './cron/cron.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    /////////////////////////////////////////////////////
    // CONNECT DATABASE
    /////////////////////////////////////////////////////

    await connectDB();

    /////////////////////////////////////////////////////
    // CREATE HTTP SERVER
    /////////////////////////////////////////////////////

    const server = http.createServer(app);

    /////////////////////////////////////////////////////
    // INITIALIZE SOCKET.IO
    /////////////////////////////////////////////////////

    initSocket(server);

    /////////////////////////////////////////////////////
    // START SERVER
    /////////////////////////////////////////////////////

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
