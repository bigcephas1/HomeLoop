import express from 'express';
import protect from '../../middleware/auth.middleware.js';
import authorizeRoles from '../../middleware/role.middleware.js';

import {
  createBooking,
  getUserBookings,
  getLandlordBookings,
  updateBookingStatus,
  cancelBooking,
} from './booking.controller.js';

const router = express.Router();

// Public routes (none, all require auth)

// Client routes
router.post('/:propertyId', protect, createBooking);
router.get('/user', protect, getUserBookings);
router.patch('/cancel/:id', protect, cancelBooking);

// Landlord routes
router.get('/landlord', protect, getLandlordBookings);
router.patch('/status/:id', protect, updateBookingStatus);

export default router;
