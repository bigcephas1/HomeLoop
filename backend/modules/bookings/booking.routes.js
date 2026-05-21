import express from 'express';
import protect from '../../middleware/auth.middleware.js';

import {
  createBooking,
  getUserBookings,
  getLandlordBookings,
  updateBookingStatus,
  cancelBooking,
} from './booking.controller.js';

const router = express.Router();

router.post('/:propertyId', protect, createBooking);

router.get('/user', protect, getUserBookings);

router.get('/landlord', protect, getLandlordBookings);

router.patch('/status/:id', protect, updateBookingStatus);
router.patch('/cancel/:id', protect, cancelBooking);

export default router;
