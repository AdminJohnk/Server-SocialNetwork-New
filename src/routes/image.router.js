'use strict';
const express = require('express');
const router = express.Router();
const ImageController = require('../controllers/image.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');
const { uploadImage } = require('../helpers/uploadImage');

// Authentication
router.use(authentication);

/// GET //

// =========================================================
/// POST //
// Upload One Image
router.post(
  '/upload-image',
  uploadImage.single('image'),
  asyncHandler(ImageController.uploadImage)
);

// Upload Multiple Images
router.post(
  '/upload-images',
  uploadImage.array('images'),
  asyncHandler(ImageController.uploadImages)
);

// =========================================================

/// PUT //

// =========================================================

/// DELETE //
// Delete Image
router.delete('/delete-images', asyncHandler(ImageController.deleteImages));

// =========================================================

module.exports = router;
