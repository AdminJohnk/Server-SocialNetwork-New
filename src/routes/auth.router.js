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

// Authentication
router.use(authentication)

// Logout
router.post('/logout', asyncHandler(AuthController.logout));

// Refresh Token
router.post('/refreshtoken', asyncHandler(AuthController.handleRefreshToken));



module.exports = router;
