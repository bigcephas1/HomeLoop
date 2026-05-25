import express from 'express';
import protect from '../../middleware/auth.middleware.js';
import authorizeRoles from '../../middleware/role.middleware.js';

import {
  initiatePayment,
  verifyPayment,
  getUserPayments,
  getLandlordPayments,
} from './payment.controller.js';

const router = express.Router();

// Client routes
router.post('/init/:bookingId', protect, initiatePayment);
router.get('/user', protect, getUserPayments);

// Landlord routes
router.get('/landlord', protect, authorizeRoles('landlord'), getLandlordPayments);

// Public verification (webhook would be better)
router.get('/verify', verifyPayment);

export default router;
