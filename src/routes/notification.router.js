'use strict';
import { Router } from 'express';
const router = Router();
import NotiController from '../controllers/notification.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';

// Authentication
router.use(authentication);

/// GET //
// Get All Notifications
router.get('/all', asyncHandler(NotiController.getAllNotifications));

// Get Unread Notifications Number
router.get('/unread-number', asyncHandler(NotiController.getUnreadNotiNumber));

// =========================================================

/// POST //

// =========================================================

/// PUT //
// Read All Notifications
router.put('/read-all', asyncHandler(NotiController.readAllNotifications));

// Mark Notification as Read
router.put('/mark-read/:notify_id', asyncHandler(NotiController.markAsRead));

// Mark All As Read
router.put('/mark-all-read', asyncHandler(NotiController.markAllAsRead));

// Set Sub Unread Notifications
router.put('/sub-unread-number', asyncHandler(NotiController.setSubUnread));

// =========================================================

/// DELETE //
// Delete Notification
router.delete('/:notify_id', asyncHandler(NotiController.deleteNotification));

// =========================================================

export default router;
