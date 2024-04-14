'use strict';
import { Router } from 'express';
const router = Router();
import NotiController from '../controllers/notification.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';

// Authentication
router.use(authentication);

/// GET //
// Get New Notification
router.get('/newnoti/:id_incr', asyncHandler(NotiController.getNewNotification));

// =========================================================

/// POST //

// =========================================================

/// PUT //

// =========================================================

/// DELETE //

// =========================================================

export default router;
