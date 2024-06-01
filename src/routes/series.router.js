'use strict';
import { Router } from 'express';
const router = Router();
import SeriesController from '../controllers/series.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';
// Authentication
router.use(authentication);

/// GET //

// Get All Series
router.get('/all', asyncHandler(SeriesController.getAllSeries));

// Get All Series By User ID
router.get('/all/:profile_id', asyncHandler(SeriesController.getAllSeriesByUserID));

// Get Series By ID
router.get('/find/:series_id', asyncHandler(SeriesController.getSeriesById));

// =========================================================

/// POST //
// Create Series
router.post('/create', asyncHandler(SeriesController.createSeries));

// Create Post
router.post('/create-post/:series_id', asyncHandler(SeriesController.createPost));

// =========================================================

/// PUT //
// Update Series
router.put('/update/:series_id', asyncHandler(SeriesController.updateSeries));

// Update Post
router.put('/update-post/:series_id', asyncHandler(SeriesController.updatePost));

// Review Series
router.put('/review', asyncHandler(SeriesController.reviewSeries));

// Like Post
router.put('/like-post', asyncHandler(SeriesController.likePost));

// Comment Post
router.put('/comment-post', asyncHandler(SeriesController.commentPost));

// Update Comment
router.put('/update-comment-post', asyncHandler(SeriesController.updateComment));

// Reply Comment
router.put('/reply-comment-post', asyncHandler(SeriesController.replyComment));

// Update Reply Comment
router.put('/update-reply-comment-post', asyncHandler(SeriesController.updateReplyComment));

// Like Comment
router.put('/like-comment-post', asyncHandler(SeriesController.likeComment));

// Like Reply Comment
router.put('/like-reply-comment-post', asyncHandler(SeriesController.likeReplyComment));

// Save Post
router.put('/save-post', asyncHandler(SeriesController.savePost));

// Increase View
router.put('/increase-view/:series_id', asyncHandler(SeriesController.increaseView));

// =========================================================

/// DELETE //
// Delete Series
router.delete('/delete/:series_id', asyncHandler(SeriesController.deleteSeries));

// Delete Post
router.delete('/delete-post/:series_id/:post_id', asyncHandler(SeriesController.deletePost));

// Delete Review
router.delete('/delete-review', asyncHandler(SeriesController.deleteReview));

// Delete Comment
router.delete('/delete-comment-post', asyncHandler(SeriesController.deleteComment));

// Delete Reply Comment
router.delete('/delete-reply-comment-post', asyncHandler(SeriesController.deleteReplyComment));

// =========================================================

export default router;
