// src/modules/notifications/notification.routes.js

import express from 'express';
import protect from '../../middleware/auth.middleware.js';
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from './notification.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/notifications - Get my notifications (works for all users)
router.get('/', getMyNotifications);

// GET /api/notifications/unread-count - Get unread count for badge (works for all users)
router.get('/unread-count', getUnreadCount);

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', markAllNotificationsRead);

// PATCH /api/notifications/:id/read - Mark single as read
router.patch('/:id/read', markNotificationRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

export default router;
