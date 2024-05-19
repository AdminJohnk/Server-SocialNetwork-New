'use strict';
import { Router } from 'express';
const router = Router();
import QuestionController from '../controllers/question.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';
// Authentication
router.use(authentication);

/// GET //


// =========================================================

/// POST //
// Create Question
router.post('/create', asyncHandler(QuestionController.createQuestion));


// =========================================================

/// PUT //
// Update Series
// router.put('/update/:series_id', asyncHandler(SeriesController.updateSeries));


// =========================================================

/// DELETE //
// Delete Series
// router.delete(
//   '/delete/:series_id',
//   asyncHandler(SeriesController.deleteSeries)
// );


// =========================================================

export default router;
