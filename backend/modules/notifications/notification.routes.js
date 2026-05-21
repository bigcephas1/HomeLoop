// src/modules/notifications/notification.routes.js

import express from 'express';

import protect from '../../middleware/auth.middleware.js';

import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from './notification.controller.js';

const router = express.Router();

/////////////////////////////////////////////////////
// GET MY NOTIFICATIONS
/////////////////////////////////////////////////////

router.get('/', protect, getMyNotifications);

/////////////////////////////////////////////////////
// MARK ONE AS READ
/////////////////////////////////////////////////////

router.patch('/:id/read', protect, markNotificationRead);

/////////////////////////////////////////////////////
// MARK ALL AS READ
/////////////////////////////////////////////////////

router.patch('/read-all', protect, markAllNotificationsRead);

/////////////////////////////////////////////////////
// DELETE
/////////////////////////////////////////////////////

router.delete('/:id', protect, deleteNotification);

export default router;
