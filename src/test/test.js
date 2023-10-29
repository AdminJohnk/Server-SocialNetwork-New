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
const { MessageModel } = require('../models/message.model');
const { default: mongoose } = require('mongoose');

// var MessageSchema = new Schema(
//   {
//     conversation_id: { type: ObjectId, ref: 'Conversation', required: true },
//     sender: { type: ObjectId, ref: 'User', required: true },
//     content: { type: String, required: true },
//     createdAt: { type: Date, required: true }
//   },
//   {
//     collection: COLLECTION_NAME
//   }
// );

router.get('', async (req, res, next) => {
  // conver conversation_id in all document from string to ObjectId in MessageModel

  const messages = await MessageModel.find({}).lean();

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    await MessageModel.findByIdAndUpdate(message._id, {
      conversation_id: new mongoose.Types.ObjectId(message.conversation_id)
    });
  }

  res.send('done');
});

module.exports = router;
