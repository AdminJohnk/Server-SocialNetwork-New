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
router.get('/find/:question_id', asyncHandler(QuestionController.getQuestionById));

// Get All Questions
router.get('/all', asyncHandler(QuestionController.getAllQuestions));

// Find Tags Question
router.get('/tags/find-tag/:tagname', asyncHandler(QuestionController.findTagsQuestion));

// Get All Tags
router.get('/tags/all', asyncHandler(QuestionController.getAllTags));

// Get Number Question
router.get('/number', asyncHandler(QuestionController.getNumberQuestions));

// Get Number Tag Question
router.get('/tags/number', asyncHandler(QuestionController.getNumberTagsQuestion));

// Get All Question By Tag
router.get('/tags/find/:tagname', asyncHandler(QuestionController.getAllQuestionByTag));

// Get Number Question By Tag
router.get('/tags/number/:tagname', asyncHandler(QuestionController.getNumberQuestionByTag));

// Get Saved Questions
router.get('/saved', asyncHandler(QuestionController.getSavedQuestions));

// Get Hot Questions
router.get('/hot', asyncHandler(QuestionController.getHotQuestions));

// Get Related Questions
router.get('/related/:question_id', asyncHandler(QuestionController.getRelatedQuestions));

// =========================================================

/// POST //
// Create Question
router.post('/create', asyncHandler(QuestionController.createQuestion));

// =========================================================

/// PUT //
// Update Question
router.put('/update/:question_id', asyncHandler(QuestionController.updateQuestion));

// View Question
router.put('/view/:question_id', asyncHandler(QuestionController.viewQuestion));

// Vote Question
router.put('/vote/:question_id', asyncHandler(QuestionController.voteQuestion));

// Update Comment Question
router.put('/comment/update/:question_id', asyncHandler(QuestionController.updateCommentQuestion));

// Comment Question
router.put('/comment/:question_id', asyncHandler(QuestionController.commentQuestion));

// Vote Comment Question
router.put('/comment/vote/:question_id', asyncHandler(QuestionController.voteCommentQuestion));

// Answer Question
router.put('/answer/:question_id', asyncHandler(QuestionController.answerQuestion));

// Update Answer
router.put('/answer/update/:question_id', asyncHandler(QuestionController.updateAnswer));

// Comment Answer
router.put('/answer/comment/:question_id', asyncHandler(QuestionController.commentAnswer));

// Update Comment Answer
router.put('/answer/comment/update/:question_id', asyncHandler(QuestionController.updateCommentAnswer));

// Vote Comment Answer
router.put('/answer/comment/vote/:question_id', asyncHandler(QuestionController.voteCommentAnswer));

// Vote Answer
router.put('/answer/vote/:question_id', asyncHandler(QuestionController.voteAnswer));

// Save Question
router.put('/save/:question_id', asyncHandler(QuestionController.saveQuestion));

// =========================================================

/// DELETE //
// Delete Question
router.delete('/delete/:question_id', asyncHandler(QuestionController.deleteQuestion));

// Delete Comment Question
router.delete('/comment/delete/:question_id', asyncHandler(QuestionController.deleteCommentQuestion));

// Delete Comment Answer
router.delete('/answer/comment/delete/:question_id', asyncHandler(QuestionController.deleteCommentAnswer));

// Delete Answer
router.delete('/answer/delete/:question_id', asyncHandler(QuestionController.deleteAnswer));

// =========================================================

export default router;
