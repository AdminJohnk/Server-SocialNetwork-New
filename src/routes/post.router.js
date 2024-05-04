'use strict';
import { Router } from 'express';
const router = Router();
import PostController from '../controllers/post.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';

// Authentication
router.use(authentication);

/// GET //
// Get All Post --> ADMIN
router.get('/all', asyncHandler(PostController.getAllPost));

// Get Post By ID
router.get('/find/:post_id', asyncHandler(PostController.getPostById));

// Get All Post By User ID
router.get('/user/:user_id', asyncHandler(PostController.getAllPostByUserId));

// Get All Post For NewsFeed
router.get('/newsfeed', asyncHandler(PostController.getAllPostForNewsFeed));

// Get All Popular Post
router.get('/popular', asyncHandler(PostController.getAllPopularPost));

// Get All User Like Post
router.get('/like/:post_id', asyncHandler(PostController.getAllUserLikePost));

// Get All User Share Post
router.get('/share/:post_id', asyncHandler(PostController.getAllUserSharePost));

// Get All User Save Post
router.get('/save/:post_id', asyncHandler(PostController.getAllUserSavePost));

//Get all saved posts
router.get('/saved', asyncHandler(PostController.getSavedPosts));

// Get Posts By Title
router.get('/search/top', asyncHandler(PostController.searchPosts));

// Get All Image Of Post
router.get('/images/:user_id', asyncHandler(PostController.getAllImage));

// Link Preview
router.get('/link-preview', asyncHandler(PostController.linkPreview));

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

// View Post
router.put('/view/:post_id', asyncHandler(PostController.viewPost));

// =========================================================

/// DELETE //
// Delete Post
router.delete('/delete/:post_id', asyncHandler(PostController.deletePost));

// =========================================================

export default router;
