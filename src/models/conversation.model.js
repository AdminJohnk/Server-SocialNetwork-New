'use strict';

const { model, Schema, Types } = require('mongoose');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Conversation';
const COLLECTION_NAME = 'conversations';

const { avt_default, pp_UserDefault } = require('../utils/constants');

const ConversationSchema = new Schema(
  {
    // common
    type: { type: String, enum: ['private', 'group'], required: true },
    members: { type: [ObjectId], ref: 'User', required: true },
    lastMessage: { type: ObjectId, ref: 'Message', default: null },
    seen: { type: [ObjectId], ref: 'User', default: [] },

    // private

    // group
    author: { type: ObjectId, ref: 'User' },
    name: { type: String },
    image: { type: String, default: avt_default }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const ConversationModel = model(DOCUMENT_NAME, ConversationSchema);

class ConversationClass {
  static async getAllConversationsByUserId({ user_id, limit, page, sort }) {
    const skip = (page - 1) * limit;
    const result = await ConversationModel.find({
      members: { $in: [user_id] }
    })
      .populate('members', pp_UserDefault)
      .populate('author', pp_UserDefault)
      .populate('seen', pp_UserDefault)
      .populate([
        {
          path: 'lastMessage',
          populate: {
            path: 'sender',
            select: pp_UserDefault
          }
        }
      ])
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
    return result || [];
  }
  static async getConversationById({ conversation_id }) {
    return await ConversationModel.findById(conversation_id)
      .populate('members', pp_UserDefault)
      .populate('seen', pp_UserDefault)
      .lean();
  }
  static async createConverSation({ type, members, name, author }) {
    if (type === 'private') {
      const foundConversation = await this.checkExist({
        type,
        members: { $all: members, $size: 2 }
      });
      if (!foundConversation) {
        return await ConversationModel.create({
          type,
          members
        });
      } else {
        return foundConversation;
      }
    }
  }
  static async checkExist(select) {
    return await ConversationModel.findOne(select).lean();
  }
}

module.exports = {
  ConversationClass,
  ConversationModel
};
