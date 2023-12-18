'use strict';
const express = require('express');
const router = express.Router();
const NotiController = require('../controllers/notification.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

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

module.exports = router;
