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

// Login Google
router.post('/login-google', asyncHandler(AuthController.loginGoogle));

// Login Github
router.get('/login-github', asyncHandler(AuthController.loginGithub));

// Get Token Repo Github
router.get('/repo-github', asyncHandler(AuthController.getTokenRepoGithub));

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

// Authentication
router.use(authentication);

// Logout
router.post('/logout', asyncHandler(AuthController.logout));

// Refresh Token
router.post('/refreshtoken', asyncHandler(AuthController.handleRefreshToken));

module.exports = router;
