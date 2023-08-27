'use strict';

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { asyncHandler } = require('../helpers/asyncHandler');

// Sign-up
router.post('/auth/signup', asyncHandler(AuthController.signUp));

// Login
router.post('/auth/login', asyncHandler(AuthController.login));


module.exports = router;
