'use strict';
import { Router } from 'express';
const router = Router();
import ImageController from '../controllers/image.controller.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authentication } from '../auth/authUtils.js';
import { uploadImage } from '../helpers/uploadImage.js';

// Authentication
router.use(authentication);

/// GET //

// =========================================================
/// POST //
// Upload One Image
router.post('/upload-one', uploadImage.single('image'), asyncHandler(ImageController.uploadImage));

// Upload Multiple Images
router.post('/upload-multiple', uploadImage.array('images'), asyncHandler(ImageController.uploadImages));

// =========================================================

/// PUT //

// =========================================================

/// DELETE //
// Delete Image
router.delete('/delete-multiple', asyncHandler(ImageController.deleteImages));

// =========================================================

export default router;
