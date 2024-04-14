import { extname } from 'path';
import multer from 'multer';
import multerS3 from 'multer-s3';
import sharp from 'sharp';
import fs from 'fs';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';

const generateFileName = (bytes = 16) => randomBytes(bytes).toString('hex');

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  },
  region: process.env.S3_BUCKET_REGION
});

function sanitizeFile(file, cb) {
  const fileExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];

  const isAllowedExt = fileExts.includes(extname(file.originalname.toLowerCase()));

  const isAllowedMimeType = file.mimetype?.startsWith('image/');

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
    const fileName = Date.now() + '_' + generateFileName() + extname(file.originalname.toLowerCase());
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
    fileSize: 1024 * 1024 * 10 // 10mb file size,
  }
});

const deleteImage = async (key) => {
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

export { uploadImage, deleteImage };
