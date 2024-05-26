'use strict';
import { Router } from 'express';
const router = Router();
import QuestionController from '../controllers/question.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';
// Authentication
router.use(authentication);

/// GET //
// Get Question By ID
router.get(
  '/find/:question_id',
  asyncHandler(QuestionController.getQuestionById)
);

// =========================================================

/// POST //
// Create Question
router.post('/create', asyncHandler(QuestionController.createQuestion));

// =========================================================

/// PUT //
// Update Question
router.put(
  '/update/:question_id',
  asyncHandler(QuestionController.updateQuestion)
);

// View Question
router.put('/view/:question_id', asyncHandler(QuestionController.viewQuestion));

// Vote Question
router.put('/vote/:question_id', asyncHandler(QuestionController.voteQuestion));

// =========================================================

/// DELETE //
// Delete Question
router.delete(
  '/delete/:question_id',
  asyncHandler(QuestionController.deleteQuestion)
);

// =========================================================

export default router;
