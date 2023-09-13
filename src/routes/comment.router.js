'use strict';
const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Authentication
router.use(authentication);

/// GET //
// Get All Parent Comments By Post ID
router.get(
  '/parents/:post_id',
  asyncHandler(CommentController.getAllParentComments)
);
// Get All Child Comments By Parent ID
router.get(
  '/children',
  asyncHandler(CommentController.getAllChildByParentID)
);

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

// =========================================================

/// DELETE //
// Delete Comments
router.delete('/:comment_id', asyncHandler(CommentController.deleteComments));

// =========================================================

module.exports = router;
