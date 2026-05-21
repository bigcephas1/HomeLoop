import express from 'express';
import protect from '../../middleware/auth.middleware.js';

import { initializePayment, verifyPayment } from './payment.controller.js';

const router = express.Router();

router.post('/init/:bookingId', protect, initializePayment);

router.get('/verify', verifyPayment);

export default router;
