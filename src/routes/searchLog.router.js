'use strict';

import SearchLogController from '../controllers/searchLog.controller.js';
import { Router } from 'express';
const router = Router();
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';

// Authentication
router.use(authentication);

// Get Search Log
router.get('/', asyncHandler(SearchLogController.getSearchLog));

// Create Search Log
router.post('/', asyncHandler(SearchLogController.createSearchLog));

// Delete Search Log
router.put('/', asyncHandler(SearchLogController.deleteSearchLog));

export default router;
