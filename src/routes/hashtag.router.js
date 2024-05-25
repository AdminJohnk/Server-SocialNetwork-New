import { Router } from 'express';
const router = Router();

import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';
import HashTagController from '../controllers/hashtag.controller.js';

// Authentication
router.use(authentication);

router.get('/all', asyncHandler(HashTagController.getAllHashtags));

export default router;