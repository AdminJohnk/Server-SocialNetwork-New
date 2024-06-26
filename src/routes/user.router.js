'use strict';
import { Router } from 'express';
const router = Router();
import UserController from '../controllers/user.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';

// Authentication
router.use(authentication);

/// GET //
// Get all users
router.get('/all/:userId', asyncHandler(UserController.getAllUsers));

// Find user by ID
router.get('/find/:user_id', asyncHandler(UserController.findUserById));

// Get Repository Github
router.get('/repositories', asyncHandler(UserController.getRepositoryGithub));

// Get My Info
router.get('/me', asyncHandler(UserController.getMyInfo));

// Find friend
router.get('/find_friend', asyncHandler(UserController.findFriend));

// Get friend list
router.get('/friend_list/:userId', asyncHandler(UserController.getAllFriends));

// Get request sent list
router.get('/request_sent', asyncHandler(UserController.getRequestsSent));

// Get request received list
router.get('/request_received', asyncHandler(UserController.getRequestsReceived));

// Get Users By Name
router.get('/search/top', asyncHandler(UserController.getUsersByName));

// Get Reputation
router.get('/reputation', asyncHandler(UserController.getReputation));

// =========================================================

/// POST //

// Send Friend Request
router.post('/send_friend_request/:friend_id', asyncHandler(UserController.sendFriendRequest));

// Cancel Friend Request
router.post('/cancel_friend_request/:friend_id', asyncHandler(UserController.cancelFriendRequest));

// Accept Friend Request
router.post('/accept_friend_request/:friend_id', asyncHandler(UserController.acceptFriendRequest));

// Decline Friend Request
router.post('/decline_friend_request/:friend_id', asyncHandler(UserController.declineFriendRequest));

// Delete Friend
router.post('/delete_friend/:friend_id', asyncHandler(UserController.deleteFriend));

// =========================================================

/// PUT //
// Update user
router.put('/update', asyncHandler(UserController.updateUserById));

// Like Post Or Unlike Post
router.put('/likepost', asyncHandler(UserController.likePost));

// Save Post Or Unsave Post
router.put('/savepost/:post_id', asyncHandler(UserController.savePost));

// =========================================================

/// DELETE //
// Delete user
router.delete('/delete', asyncHandler(UserController.deleteUser));

// =========================================================

export default router;
