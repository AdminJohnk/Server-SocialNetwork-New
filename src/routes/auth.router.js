'use strict';

import { Router } from 'express';
const router = Router();
import AuthController from '../controllers/auth.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';

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

// Change Password
router.post('/change-password', asyncHandler(AuthController.changePassword));

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

export default router;
