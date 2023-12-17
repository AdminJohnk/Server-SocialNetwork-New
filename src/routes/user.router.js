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

// Get My Info
router.get('/me', asyncHandler(UserController.getMyInfo));

// Check Exist Email
router.put('/checkemail/:email', asyncHandler(UserController.checkExistEmail));

// =========================================================

/// POST //

// =========================================================

/// PUT //
// Update user
router.put('/update', asyncHandler(UserController.updateUserById));

// Add Follow Or Unfollow User
router.put('/follow/:user_id', asyncHandler(UserController.followUser));

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
