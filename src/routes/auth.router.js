'use strict';

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Sign-up
router.post('/signup', asyncHandler(AuthController.signUp));

// Login
router.post('/login', asyncHandler(AuthController.login));

// Forgot Password
router.post('/forgot', asyncHandler(AuthController.forgotPassword));

// Verify code
router.post('/verify', asyncHandler(AuthController.verifyCode));

// Reset password
router.post('/reset', asyncHandler(AuthController.resetPassword));

// Check verify
router.post('/checkVerify', asyncHandler(AuthController.checkVerify));

// Check reset
router.post('/checkReset', asyncHandler(AuthController.checkReset));

// Get Repository Github
router.get('/github', asyncHandler(AuthController.callbackGithub));

// Authentication
router.use(authentication);

// Logout
router.post('/logout', asyncHandler(AuthController.logout));

// Refresh Token
router.post('/refreshtoken', asyncHandler(AuthController.handleRefreshToken));

module.exports = router;
