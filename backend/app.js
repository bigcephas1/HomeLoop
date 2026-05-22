import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import corsOptions from './config/cors.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import propertyRoutes from './modules/properties/property.routes.js';
import favoriteRoutes from './modules/favorites/favorite.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import chatRoutes from './modules/messages/message.routes.js';
import messageRoutes from './modules/messages/message.routes.js';
import uploadRoutes from './modules/uploads/upload.routes.js';

import errorMiddleware from './middleware/error.middleware.js';

const app = express();


app.use(express.json());
app.use(cookieParser());

app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/', (req, res) => {
  res.send('HomeLoop API Running...');
});

app.use(errorMiddleware);

export default app;
