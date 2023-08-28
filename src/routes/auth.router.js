'use strict';

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');


// Sign-up
router.post('/auth/signup', asyncHandler(AuthController.signUp));

// Login
router.post('/auth/login', asyncHandler(AuthController.login));

// Authentication
router.use(authentication)

// Logout
router.post('/auth/logout', asyncHandler(AuthController.logout));


module.exports = router;
