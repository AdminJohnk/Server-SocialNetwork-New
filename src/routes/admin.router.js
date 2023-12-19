'use strict';
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');
const { checkIsAdmin } = require('../middlewares/admin.middleware');

// Authentication
router.use(authentication);
router.use(asyncHandler(checkIsAdmin));

/// GET //
// Get all users
router.get('/users',asyncHandler(AdminController.getAllUsers));

// Find user by id
router.get('/users/find/:user_id',asyncHandler(AdminController.findUserById));

// Get all posts
router.get('/posts',asyncHandler(AdminController.getAllPosts));

// Find post by id
router.get('/posts/find/:post_id',asyncHandler(AdminController.findPostById));

// Get all parent comment
router.get('/comments/parents/:post_id',asyncHandler(AdminController.getAllParentComments));

// Get all child comment
router.get('/comments/children/:parent_id',asyncHandler(AdminController.getAllChildComments));


// =========================================================

/// POST //
// Create user
router.post('/users/create',asyncHandler(AdminController.createUser));

// Create post
router.post('/posts/create',asyncHandler(AdminController.createPost));

// =========================================================

/// PUT //
// Update user
router.put('/users/update/:user_id',asyncHandler(AdminController.updateUser));

// Update post
router.put('/posts/update/:post_id',asyncHandler(AdminController.updatePost));

// Update comment
router.put('/comments/update/:comment_id',asyncHandler(AdminController.updateComment));

// =========================================================

/// DELETE //
// Delete user
router.delete('/users/delete/:user_id',asyncHandler(AdminController.deleteUser));

// Delete post
router.delete('/posts/delete/:post_id',asyncHandler(AdminController.deletePost));

// Delete Comment
router.delete('/comments/delete/:comment_id',asyncHandler(AdminController.deleteComment));

// =========================================================

module.exports = router;
