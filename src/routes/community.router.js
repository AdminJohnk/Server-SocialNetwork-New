'use strict';
const express = require('express');
const router = express.Router();
const Communitytroller = require('../controllers/community.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Authentication
router.use(authentication);

/// GET //
// Search member by keySearch (name, email)
router.get(
  '/members/search/:community_id',
  asyncHandler(Communitytroller.searchMember)
);

// =========================================================

/// POST //
// Create new community
router.post('/create', asyncHandler(Communitytroller.createCommunity));

// =========================================================

/// PUT //
// Join community
router.put('/join/:community_id', asyncHandler(Communitytroller.joinCommunity));

// Follow community
router.put(
  '/follow/:community_id',
  asyncHandler(Communitytroller.followCommunity)
);

// Update community --> ADMIN_COMMUNITY
// Chỉ có thể update các trường: name, description, about, tags, rules
router.put(
  '/update/:community_id',
  asyncHandler(Communitytroller.updateCommunity)
);

// Accept join request  --> ADMIN_COMMUNITY
router.put(
  '/accept/:community_id',
  asyncHandler(Communitytroller.acceptJoinRequest)
);

// Accept post --> ADMIN_COMMUNITY
router.put(
  '/accept-post/:community_id',
  asyncHandler(Communitytroller.acceptPost)
);

// Add member to community --> ADMIN_COMMUNITY
router.put(
  '/add-members/:community_id',
  asyncHandler(Communitytroller.addMemberToCommunity)
);

// Delete member from community --> ADMIN_COMMUNITY
router.put(
  '/delete-members/:community_id',
  asyncHandler(Communitytroller.deleteMemberFromCommunity)
);

// =========================================================

/// DELETE //

// =========================================================

module.exports = router;
