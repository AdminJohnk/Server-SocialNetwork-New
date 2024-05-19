'use strict';
import { Router } from 'express';
const router = Router();
import CommunityController from '../controllers/community.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';

// Authentication
router.use(authentication);

/// GET //
// Get communities by user_id
router.get('/user/:user_id', asyncHandler(CommunityController.getCommunitiesByUserID));

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

// Reject join request  --> ADMIN_COMMUNITY
router.put('/reject/:community_id', asyncHandler(CommunityController.rejectJoinRequest));

// Accept post --> ADMIN_COMMUNITY
router.put('/accept-post/:community_id', asyncHandler(CommunityController.acceptPost));

// Reject post --> ADMIN_COMMUNITY
router.put('/reject-post/:community_id', asyncHandler(CommunityController.rejectPost));

// Add member to community --> ADMIN_COMMUNITY
router.put('/add-members/:community_id', asyncHandler(CommunityController.addMemberToCommunity));

// Delete member from community --> ADMIN_COMMUNITY
router.put('/delete-members/:community_id', asyncHandler(CommunityController.deleteMemberFromCommunity));

// Promote admin --> ADMIN_COMMUNITY
router.put('/promote-admin/:community_id', asyncHandler(CommunityController.promoteAdmin));

// Revoke admin --> ADMIN_COMMUNITY`
router.put('/revoke-admin/:community_id', asyncHandler(CommunityController.revokeAdmin));

// =========================================================

/// DELETE //

// =========================================================

export default router;
