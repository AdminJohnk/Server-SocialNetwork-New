'use strict';

const SearchLogController = require('../controllers/searchLog.controller');
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Authentication
router.use(authentication);

// Get Search Log
router.get('/', asyncHandler(SearchLogController.getSearchLog));

// Create Search Log
router.post('/', asyncHandler(SearchLogController.createSearchLog));

module.exports = router;