'use strict';
const express = require('express');
const router = express.Router();
const CommunityController = require('../controllers/community.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Authentication
router.use(authentication);

/// GET //
// Search member by keySearch (name, email)
router.get('/members/search/:community_id', asyncHandler(CommunityController.searchMember));

// Get community by id
router.get('/:community_id', asyncHandler(CommunityController.getCommunityByID));

// =========================================================

/// POST //
// Create new community
router.post('/create', asyncHandler(CommunityController.createCommunity));

// =========================================================

/// PUT //
// Join community
router.put('/join/:community_id', asyncHandler(CommunityController.joinCommunity));

// Follow community
router.put('/follow/:community_id', asyncHandler(CommunityController.followCommunity));

// Update community --> ADMIN_COMMUNITY
// Chỉ có thể update các trường: name, description, about, tags, rules
router.put('/update/:community_id', asyncHandler(CommunityController.updateCommunity));

// Accept join request  --> ADMIN_COMMUNITY
router.put('/accept/:community_id', asyncHandler(CommunityController.acceptJoinRequest));

// Accept post --> ADMIN_COMMUNITY
router.put('/accept-post/:community_id', asyncHandler(CommunityController.acceptPost));

// Add member to community --> ADMIN_COMMUNITY
router.put('/add-members/:community_id', asyncHandler(CommunityController.addMemberToCommunity));

// Delete member from community --> ADMIN_COMMUNITY
router.put('/delete-members/:community_id', asyncHandler(CommunityController.deleteMemberFromCommunity));

// =========================================================

/// DELETE //

// =========================================================

module.exports = router;
