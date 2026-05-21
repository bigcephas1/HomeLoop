import express from 'express';
import protect from '../../middleware/auth.middleware.js';
import authorizeRoles from '../../middleware/role.middleware.js';

import {
  createProperty,
  getProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
  getNearbyProperties,
  getAllPropertiesAdmin,
  approveProperty,
  rejectProperty,
  suspendProperty,
  verifyLandlordProperty,
  getModerationLogs,
} from './property.controller.js';

const router = express.Router();

/////////////////////////////////////////////////////
// PUBLIC ROUTES
/////////////////////////////////////////////////////

router.get('/near', getNearbyProperties);

router.get('/', getProperties);

/////////////////////////////////////////////////////
// ADMIN ROUTES
// IMPORTANT:
// Place admin routes BEFORE "/:id"
// to prevent route collision
/////////////////////////////////////////////////////

router.get(
  '/admin/all',
  protect,
  authorizeRoles('admin'),
  getAllPropertiesAdmin,
);

router.get(
  '/admin/moderation-logs',
  protect,
  authorizeRoles('admin'),
  getModerationLogs,
);

router.patch(
  '/admin/approve/:id',
  protect,
  authorizeRoles('admin'),
  approveProperty,
);

router.patch(
  '/admin/reject/:id',
  protect,
  authorizeRoles('admin'),
  rejectProperty,
);

router.patch(
  '/admin/suspend/:id',
  protect,
  authorizeRoles('admin'),
  suspendProperty,
);

router.patch(
  '/admin/verify/:id',
  protect,
  authorizeRoles('admin'),
  verifyLandlordProperty,
);

/////////////////////////////////////////////////////
// SINGLE PROPERTY ROUTE
/////////////////////////////////////////////////////

router.get('/:id', getSingleProperty);

/////////////////////////////////////////////////////
// USER ROUTES
/////////////////////////////////////////////////////

router.post('/', protect, authorizeRoles('landlord', 'admin'), createProperty);

router.patch(
  '/:id',
  protect,
  authorizeRoles('landlord', 'admin'),
  updateProperty,
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('landlord', 'admin'),
  deleteProperty,
);

export default router;
