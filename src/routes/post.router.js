'use strict';
const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Authentication
router.use(authentication);

/// GET //
// Get All Post --> ADMIN
router.get('/all', asyncHandler(PostController.getAllPost));

// Get Post By ID
router.get('/find/:post_id', asyncHandler(PostController.getPostById));

// Get All Post By User ID
router.get('/user/:user_id', asyncHandler(PostController.getAllPostByUserId));

// =========================================================

/// POST //
// Create Post
router.post('/', asyncHandler(PostController.createPost));

// Share Post
router.post('/share', asyncHandler(PostController.sharePost));

// =========================================================

/// PUT //
// Update Post
router.put('/update/:post_id', asyncHandler(PostController.updatePost));

// =========================================================

/// DELETE //
// Delete Post
router.delete('/delete/:post_id', asyncHandler(PostController.deletePost));

// =========================================================

module.exports = router;
