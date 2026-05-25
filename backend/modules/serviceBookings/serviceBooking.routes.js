import express from 'express';
import protect from '../../middleware/auth.middleware.js';
import { createServiceBooking, getMyServiceBookings, updateBookingStatus } from './serviceBooking.controller.js';

const router = express.Router();
router.use(protect);

router.post('/', createServiceBooking);
router.get('/my-bookings', getMyServiceBookings);
router.patch('/:id/status', updateBookingStatus);

export default router;
