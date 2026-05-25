// src/modules/notifications/notification.controller.js

import Notification from './notification.model.js';

/////////////////////////////////////////////////////
// HELPER: CREATE NOTIFICATION
/////////////////////////////////////////////////////

export const createNotification = async (userId, title, message, type, link = null, metadata = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link: link || '',
      metadata,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/////////////////////////////////////////////////////
// HELPER: CREATE BULK NOTIFICATIONS
/////////////////////////////////////////////////////

export const createBulkNotifications = async (userIds, title, message, type, link = null) => {
  try {
    const notifications = userIds.map(userId => ({
      user: userId,
      title,
      message,
      type,
      link: link || '',
    }));
    const result = await Notification.insertMany(notifications);
    return result;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return [];
  }
};

/////////////////////////////////////////////////////
// GET MY NOTIFICATIONS (Works for ALL users including admin)
/////////////////////////////////////////////////////

export const getMyNotifications = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    
    // Regular users should NOT see system notifications
    // Admins CAN see system notifications (for monitoring)
    if (req.user.role !== 'admin') {
      filter.type = { $ne: 'system' };
    }
    
    const notifications = await Notification.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// GET UNREAD COUNT (Works for ALL users)
/////////////////////////////////////////////////////

export const getUnreadCount = async (req, res) => {
  try {
    const filter = { user: req.user._id, isRead: false };
    
    // Regular users should not count system notifications
    if (req.user.role !== 'admin') {
      filter.type = { $ne: 'system' };
    }
    
    const count = await Notification.countDocuments(filter);
    
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// MARK SINGLE NOTIFICATION AS READ
/////////////////////////////////////////////////////

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// MARK ALL AS READ
/////////////////////////////////////////////////////

export const markAllNotificationsRead = async (req, res) => {
  try {
    const filter = { user: req.user._id, isRead: false };
    
    if (req.user.role !== 'admin') {
      filter.type = { $ne: 'system' };
    }
    
    await Notification.updateMany(filter, { isRead: true });

    res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// DELETE NOTIFICATION
/////////////////////////////////////////////////////

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
