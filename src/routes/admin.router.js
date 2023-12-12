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

// Get All Child Comments By Parent ID
router.get('/comments/children',asyncHandler(AdminController.getAllChildByParentID));

// =========================================================

/// POST //
// Create user
router.post('/users/create',asyncHandler(AdminController.createUser));

// =========================================================

/// PUT //
// Update user
router.put('/users/update/:user_id',asyncHandler(AdminController.updateUser));

// Update post
router.put('/posts/update/:post_id',asyncHandler(AdminController.updatePost));

// =========================================================

/// DELETE //
// Delete user
router.delete('/users/delete/:user_id',asyncHandler(AdminController.deleteUser));

// Delete post
router.delete('/posts/delete/:post_id',asyncHandler(AdminController.deletePost));

// =========================================================

module.exports = router;
