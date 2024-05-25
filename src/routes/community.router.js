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

// Get all communities you manage
router.get('/manage', asyncHandler(CommunityController.getAllCommunitiesYouManage));

// Get community by id
router.get('/:community_id', asyncHandler(CommunityController.getCommunityByID));

// Get all posts of community
router.get('/:community_id/posts', asyncHandler(CommunityController.getPostsByCommunityID));

// Get post of community by post_id
router.get('/:community_id/post/:post_id', asyncHandler(CommunityController.getPostByID));

// Get all images of community
router.get('/images/:community_id', asyncHandler(CommunityController.getAllImagesByCommunityID));

// =========================================================

/// POST //
// Create new community
router.post('/create', asyncHandler(CommunityController.createCommunity));

// =========================================================

/// PUT //
// Join community
router.put('/join/:community_id', asyncHandler(CommunityController.joinCommunity));

// Cancel join request
router.put('/cancel-join/:community_id', asyncHandler(CommunityController.cancelJoinCommunity));

// Leave community
router.put('/leave/:community_id', asyncHandler(CommunityController.leaveCommunity));

// Follow community
router.put('/follow/:community_id', asyncHandler(CommunityController.followCommunity));

// Update community --> ADMIN_COMMUNITY
// Chỉ có thể update các trường: name, description, about, tags, rules
router.put('/update/:community_id', asyncHandler(CommunityController.updateCommunity));

// Cede creator --> ADMIN_COMMUNITY
router.put('/cede-creator/:community_id', asyncHandler(CommunityController.cedeCreator));

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
