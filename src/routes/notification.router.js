'use strict';
const express = require('express');
const router = express.Router();
const NotiController = require('../controllers/notification.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Authentication
router.use(authentication);

/// GET //
// List Notification By User
router.get('/listnoti', asyncHandler(NotiController.listNotiByUser));

// =========================================================

/// POST //


// =========================================================

/// PUT //


// =========================================================

/// DELETE //


// =========================================================

module.exports = router;
