import express from 'express';
import protect from '../../middleware/auth.middleware.js';
import {
  createOrUpdateProfile,
  getMyProfile,
  submitForVerification,
} from './providerProfile.controller.js';

console.log('✅ Provider profile controller loaded');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/provider-profiles/me - Get my profile
router.get('/me', getMyProfile);

// POST /api/provider-profiles - Create/Update profile
router.post('/', createOrUpdateProfile);

// PATCH /api/provider-profiles/submit-verification - Submit for verification
router.patch('/submit-verification', submitForVerification);

export default router;
