'use strict';
const express = require('express');
const router = express.Router();

const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  },
  region: process.env.S3_BUCKET_REGION
});

function sanitizeFile(file, cb) {
  const fileExts = ['.png', '.jpg', '.jpeg', '.gif'];

  const isAllowedExt = fileExts.includes(
    path.extname(file.originalname.toLowerCase())
  );

  const isAllowedMimeType = file.mimetype.startsWith('image/');

  if (isAllowedExt && isAllowedMimeType) {
    return cb(null, true);
  } else {
    cb('Error: File type not allowed!');
  }
}

const s3Storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET_NAME,
  // acl: 'public-read',
  metadata: (req, file, cb) => {
    cb(null, { fieldname: file.fieldname });
  },
  key: (req, file, cb) => {
    const fileName =
      Date.now() + '_' + file.fieldname + '_' + file.originalname;
    cb(null, fileName);
  }
});

// our middleware
const uploadImage = multer({
  storage: s3Storage,
  fileFilter: (req, file, callback) => {
    sanitizeFile(file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 5 // 2mb file size
  }
});

const deleteImage = async key => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  };
  try {
    await s3.send(new DeleteObjectCommand(params));
  } catch (error) {
    console.log(`error::`, error);
  }
};

router.put('/upload-image', uploadImage.single('image'), async (req, res) => {
  if (req.file) {
    res.status(200).json({
      message: 'success',
      data: req.file
    });
  }
});
router.put('/upload-images', uploadImage.array('image'), async (req, res) => {
  if (req.file) {
    res.status(200).json({
      message: 'success',
      data: req.file
    });
  }
});
router.delete('/delete-image/:key', async (req, res, next) => {
  const key = req.params.key;
  deleteImage(key).then(() => { 
    res.status(200).json({
      message: 'success'
    });
  }).catch(error => {
    next(error);
  })
});

router.get('', (req, res, next) => {
  res.status(200).send('Hello world');
});

module.exports = router;
