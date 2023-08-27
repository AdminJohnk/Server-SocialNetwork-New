'use strict';

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// Sign-up
router.post('/auth/signup', AuthController.signUp);

module.exports = router;