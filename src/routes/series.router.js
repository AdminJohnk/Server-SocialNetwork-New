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

// Get Series By ID
router.get('/find/:series_id', asyncHandler(SeriesController.getSeriesById));


// =========================================================

/// POST //
// Create Series
router.post('/create', asyncHandler(SeriesController.createSeries));

// Create Post
router.post('/create-post', asyncHandler(SeriesController.createPost));



// =========================================================

/// PUT //
// Update Series
router.put('/update/:series_id', asyncHandler(SeriesController.updateSeries));

// Update Post
router.put('/update-post', asyncHandler(SeriesController.updatePost));

// Review Series
router.put('/review', asyncHandler(SeriesController.reviewSeries));

// Like Post
router.put('/like-post', asyncHandler(SeriesController.likePost));

// Comment Post
router.put('/comment-post', asyncHandler(SeriesController.commentPost));

// Save Post
router.put('/save-post', asyncHandler(SeriesController.savePost));


// =========================================================

/// DELETE //


// =========================================================

export default router;
