'use strict';
const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');
const { uploadImage } = require('../helpers/uploadImage');

// Authentication
router.use(authentication);

/// GET //
// Get conversations By ID
router.get(
  '/conversations/find/:conversation_id',
  asyncHandler(ChatController.getConversationById)
);

// Get All conversations By User ID
router.get(
  '/conversations',
  asyncHandler(ChatController.getAllConversationsByUserId)
);

// Get conversations by Message Types
router.get(
  '/conversations/called',
  asyncHandler(ChatController.getConversationsByMessageTypes)
);

// Get messages By Conversation ID
router.get(
  '/conversations/:conversation_id/messages',
  asyncHandler(ChatController.getMessagesByConversationId)
);

// Get token for call
router.get('/token', asyncHandler(ChatController.getTokenForCall));

// =========================================================
/// POST //
// Create conversation
router.post(
  '/conversations/create',
  asyncHandler(ChatController.createConverSation)
);

// =========================================================

/// PUT //
// Change Conversation Name
router.put(
  '/conversations/:conversation_id/name',
  asyncHandler(ChatController.changeConversationName)
);

// Add Member To Conversation
router.put(
  '/conversations/:conversation_id/members',
  asyncHandler(ChatController.addMemberToConversation)
);

// Change Conversation Image
router.put(
  '/conversations/:conversation_id/image',
  uploadImage.single('image'),
  asyncHandler(ChatController.changeConversationImage)
);

// Change Conversation Cover Image
router.put(
  '/conversations/:conversation_id/cover-image',
  uploadImage.single('image'),
  asyncHandler(ChatController.changeConversationCoverImage)
);

// Leave Group Conversation
router.put(
  '/conversations/:conversation_id/leave',
  asyncHandler(ChatController.leaveGroupConversation)
);

// Appoint admin for group conversation
router.put(
  '/conversations/:conversation_id/admins',
  asyncHandler(ChatController.appointAdmin)
);

// Remove admin role for group conversation
router.put(
  '/conversations/:conversation_id/admins/remove',
  asyncHandler(ChatController.removeAdmin)
);

// =========================================================

/// DELETE //
// Delete Member From Conversation
router.delete(
  '/conversations/:conversation_id/members/delete',
  asyncHandler(ChatController.deleteMemberFromConversation)
);

// Delete Conversation
router.delete(
  '/conversations/:conversation_id',
  asyncHandler(ChatController.deleteConversation)
);

// =========================================================

module.exports = router;
