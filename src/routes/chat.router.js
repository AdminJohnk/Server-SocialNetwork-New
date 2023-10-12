'use strict';
const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Authentication
router.use(authentication);

/// GET //
// Get conversations By ID
router.get('/conversations/find/:conversation_id', asyncHandler(ChatController.getConversationById));

// Get All conversations By User ID
router.get('/conversations', asyncHandler(ChatController.getAllConversationsByUserId));

// Get messages By Conversation ID
router.get('/conversations/:conversation_id/messages', asyncHandler(ChatController.getMessagesByConversationId));

// =========================================================

/// POST //
// Create conversation
router.post('/conversations/create', asyncHandler(ChatController.createConverSation));

// =========================================================

/// PUT //

// =========================================================

/// DELETE //

// =========================================================

module.exports = router;
