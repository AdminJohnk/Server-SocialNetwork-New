'use strict';
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Authentication
router.use(authentication);

/// GET //
// Find user by ID
router.get('/find/:user_id', asyncHandler(UserController.findUserById));

// Get Should Follow User (***)
router.get('/shouldfollow', asyncHandler(UserController.getShouldFollow));

// Get Repository Github
router.get('/repositories', asyncHandler(UserController.getRepositoryGithub));

// =========================================================

/// POST //

// =========================================================

/// PUT //
// Update user
router.put('/:user_id', asyncHandler(UserController.updateUserById));


// =========================================================

/// DELETE //

// =========================================================

module.exports = router;
