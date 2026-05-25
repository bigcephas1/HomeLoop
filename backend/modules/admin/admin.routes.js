import express from 'express';
import protect from '../../middleware/auth.middleware.js';
import authorizeRoles from '../../middleware/role.middleware.js';
import {
  getDashboardOverview,
  getRecentBookings,
  getRecentPayments,
  getTopProperties,
  getRecentUsers,
  getProviderProfiles,
  approveProviderProfile,
  rejectProviderProfile,
  suspendProvider, // Add this
  approveProperty,
  rejectProperty,
  suspendProperty,
  compareDocuments, // Add this
  verifyServiceCredibility, // Add this
} from './admin.controller.js';

const router = express.Router();

// All admin routes protected
router.use(protect, authorizeRoles('admin'));

// Dashboard
router.get('/dashboard', getDashboardOverview);
router.get('/recent-bookings', getRecentBookings);
router.get('/recent-payments', getRecentPayments);
router.get('/top-properties', getTopProperties);
router.get('/recent-users', getRecentUsers);

// Provider Management
router.get('/providers', getProviderProfiles);
router.patch('/providers/approve/:id', approveProviderProfile);
router.patch('/providers/reject/:id', rejectProviderProfile);
router.patch('/providers/suspend/:id', suspendProvider); // NEW

// Property Moderation
router.patch('/properties/approve/:id', approveProperty);
router.patch('/properties/reject/:id', rejectProperty);
router.patch('/properties/suspend/:id', suspendProperty);

// Document Verification
router.post('/verify/documents/compare/:providerId/:propertyId', compareDocuments); // NEW
router.post('/verify/credibility/:providerId', verifyServiceCredibility); // NEW

export default router;
