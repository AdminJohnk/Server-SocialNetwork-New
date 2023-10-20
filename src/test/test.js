'use strict';
const express = require('express');
const router = express.Router();
const NotiController = require('../controllers/notification.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY
    // secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  },
  region: process.env.S3_BUCKET_REGION
});

const s3Storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET_NAME,
  // acl: "public-read",
  metadata: (req, file, cb) => {
    cb(null, { fieldname: file.fieldname });
  },
  key: (req, file, cb) => {
    const fileName =
      Date.now() + '_' + file.fieldname + '_' + file.originalname;
    cb(null, fileName);
  }
});

// function to sanitize files and send error for unsupported files
function sanitizeFile(file, cb) {
  // Define the allowed extension
  const fileExts = ['.png', '.jpg', '.jpeg', '.gif'];

  // Check allowed extensions
  const isAllowedExt = fileExts.includes(
    path.extname(file.originalname.toLowerCase())
  );

  // Mime type must be an image
  const isAllowedMimeType = file.mimetype.startsWith('image/');

  if (isAllowedExt && isAllowedMimeType) {
    return cb(null, true); // no errors
  } else {
    // pass error msg to callback, which can be displaye in frontend
    cb('Error: File type not allowed!');
  }
}

// our middleware
const uploadImage = multer({
  storage: s3Storage,
  fileFilter: (req, file, callback) => {
    sanitizeFile(file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 2 // 2mb file size
  }
});

router.put('/upload-image', upload.single('avatar'), (req, res, next) => {
  console.log(req.file);

  res.status(200).send(req.file);
});

router.get('', (req, res, next) => {
  res.status(200).send('Hello world');
});

module.exports = router;
