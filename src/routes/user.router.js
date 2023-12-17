'use strict';
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Authentication
router.use(authentication);

/// GET //
// Find user by ID
router.get('/find/:user_id', asyncHandler(UserController.findUserById));

// Get Repository Github
router.get('/repositories', asyncHandler(UserController.getRepositoryGithub));

// Get My Info
router.get('/me', asyncHandler(UserController.getMyInfo));

// =========================================================

/// POST //

// =========================================================

/// PUT //
// Update user
router.put('/update', asyncHandler(UserController.updateUserById));

// Like Post Or Unlike Post
router.put('/likepost', asyncHandler(UserController.likePost));

// Save Post Or Unsave Post
router.put('/savepost/:post_id', asyncHandler(UserController.savePost));

// =========================================================

/// DELETE //
// Delete user
router.delete('/delete', asyncHandler(UserController.deleteUser));

// =========================================================

module.exports = router;
