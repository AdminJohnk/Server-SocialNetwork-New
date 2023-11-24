'use strict';

const { model, Schema, Types } = require('mongoose');
const { pp_UserDefault } = require('../utils/constants');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Message';
const COLLECTION_NAME = 'messages';

const MessageSchema = new Schema(
  {
    conversation_id: { type: ObjectId, ref: 'Conversation', required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'notification', 'audio', 'file', 'voice', 'video'],
      default: 'text'
    },
    images: { type: [String], default: null },
    sender: { type: ObjectId, ref: 'User', required: true },
    content: { type: String, default: null },
    createdAt: { type: Date, required: true }
  },
  {
    collection: COLLECTION_NAME
  }
);

MessageSchema.index({ conversation_id: 1, createdAt: -1 });

const MessageModel = model(DOCUMENT_NAME, MessageSchema);

class MessageClass {
  static async deleteMessagesByConversationId({ conversation_id }) {
    return await MessageModel.deleteMany({ conversation_id });
  }
  static async getMessagesByConversationId({ conversation_id, limit, page, sort, extend }) {
    const skip = (page - 1) * limit + extend;
    const result = await MessageModel.find({ conversation_id })
      .populate('sender', pp_UserDefault)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    return result.reverse() || [];
  }
  static async getImageMessageByConversationId({ conversation_id, limit, page, sort, extend }) {
    const skip = (page - 1) * limit + extend;
    const result = await MessageModel.find({ conversation_id, images: { $ne: null } })
      .populate('sender', pp_UserDefault)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    return result.reverse() || [];
  }
  static async checkExist(select) {
    return await MessageModel.findOne(select).lean();
  }
}

module.exports = {
  MessageClass,
  MessageModel
};
