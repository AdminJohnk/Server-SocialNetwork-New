'use strict';
const express = require('express');
const router = express.Router();
const FollowController = require('../controllers/follow.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Authentication
router.use(authentication);

/// GET //
// Get List Following By User ID
router.get('/following/:user_id', asyncHandler(FollowController.getListFollowingByUserId));

// Get List Followers By User ID
router.get('/followers/:user_id', asyncHandler(FollowController.getListFollowersByUserId));

// =========================================================

/// POST //

// =========================================================

/// PUT //
// Add Follow
router.put('/user/:user_id', asyncHandler(FollowController.followUser));


// =========================================================

/// DELETE //

// =========================================================

module.exports = router;
