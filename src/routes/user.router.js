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

// Get Should Follow User (***)
router.get('/shouldfollow', asyncHandler(UserController.getShouldFollow));

// Get List Following By User ID
router.get(
  '/following/:user_id',
  asyncHandler(UserController.getListFollowingByUserId)
);

// Get List Followers By User ID
router.get(
  '/followers/:user_id',
  asyncHandler(UserController.getListFollowersByUserId)
);

// Get Repository Github
router.get('/repositories', asyncHandler(UserController.getRepositoryGithub));

// =========================================================

/// POST //

// =========================================================

/// PUT //
// Update user
router.put('/update', asyncHandler(UserController.updateUserById));

// Update Tags
router.put('/tags/:user_id', asyncHandler(UserController.updateTags));

// Add Follow Or Unfollow User
router.put('/follow/:user_id', asyncHandler(UserController.followUser));

// Like Post Or Unlike Post
router.put('/likepost', asyncHandler(UserController.likePost));

// Save Post Or Unsave Post
router.put('/savepost/:post_id', asyncHandler(UserController.savePost));

// =========================================================

/// DELETE //

// =========================================================

module.exports = router;