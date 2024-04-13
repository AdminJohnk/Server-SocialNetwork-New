'use strict';
import { Router } from 'express';
const router = Router();
import AdminController from '../controllers/admin.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';
import { checkIsAdmin } from '../middlewares/admin.middleware.js';

// Authentication
router.use(authentication);
router.use(asyncHandler(checkIsAdmin));

/// GET //
// Get all users
router.get('/users/:page/:pagesize', asyncHandler(AdminController.getAllUsers));

// Find user by id
router.get('/users/find/:user_id', asyncHandler(AdminController.findUserById));

// Get user number
router.get('/users/number', asyncHandler(AdminController.getUserNumber));

// Get all posts
router.get('/posts/:page/:pagesize', asyncHandler(AdminController.getAllPosts));

// Find post by id
router.get('/posts/find/:post_id', asyncHandler(AdminController.findPostById));

// Get post number
router.get('/posts/number', asyncHandler(AdminController.getPostNumber));

// Get all parent comment
router.get('/comments/parents/:post_id', asyncHandler(AdminController.getAllParentComments));

// Get all child comment
router.get('/comments/children/:parent_id', asyncHandler(AdminController.getAllChildComments));

// =========================================================

/// POST //
// Create user
router.post('/users/create', asyncHandler(AdminController.createUser));

// Create post
router.post('/posts/create', asyncHandler(AdminController.createPost));

// =========================================================

/// PUT //
// Update user
router.put('/users/update/:user_id', asyncHandler(AdminController.updateUser));

// Update post
router.put('/posts/update/:post_id', asyncHandler(AdminController.updatePost));

// Update comment
router.put('/comments/update/:comment_id', asyncHandler(AdminController.updateComment));

// =========================================================

/// DELETE //
// Delete user
router.delete('/users/delete/:user_id', asyncHandler(AdminController.deleteUser));

// Delete post
router.delete('/posts/delete/:post_id', asyncHandler(AdminController.deletePost));

// Delete Comment
router.delete('/comments/delete/:comment_id', asyncHandler(AdminController.deleteComment));

// =========================================================

export default router;
