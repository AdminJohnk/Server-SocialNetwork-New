'use strict';
import { Router } from 'express';
const router = Router();
import CommentController from '../controllers/comment.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';

// Authentication
router.use(authentication);

/// GET //
// Get All Parent Comments By Post ID
router.get('/parents/:post_id', asyncHandler(CommentController.getAllParentComments));
// Get All Child Comments By Parent ID
router.get('/:parent_id/children/:post_id', asyncHandler(CommentController.getAllChildByParentID));

// =========================================================

/// POST //
// Comment Post
router.post('/create', asyncHandler(CommentController.commentPost));

// =========================================================

/// PUT //
// Update Comment
router.put('/update/:comment_id', asyncHandler(CommentController.updateComment));

// Like Comment
router.put('/like/:comment_id', asyncHandler(CommentController.likeComment));

// Dislike Comment
router.put('/dislike/:comment_id', asyncHandler(CommentController.dislikeComment));

// =========================================================

/// DELETE //
// Delete Comments
router.delete('/:comment_id', asyncHandler(CommentController.deleteComments));

// =========================================================

export default router;
