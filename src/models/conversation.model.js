'use strict';

const { model, Schema, Types } = require('mongoose');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Conversation';
const COLLECTION_NAME = 'conversations';

const { pp_UserDefault } = require('../utils/constants');

const ConversationSchema = new Schema(
  {
    // common
    type: { type: String, enum: ['private', 'group'], required: true },
    members: { type: [ObjectId], ref: 'User', required: true },
    lastMessage: { type: ObjectId, ref: 'Message', default: null },
    seen: { type: [ObjectId], ref: 'User', default: [] },

    // private

    // group
    admins: { type: [ObjectId], ref: 'User', default: [] },
    name: String,
    image: String,
    cover_image: String
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const ConversationModel = model(DOCUMENT_NAME, ConversationSchema);

class ConversationClass {
  static async removeAdmin({ admins, conversation_id }) {
    return await ConversationModel.findByIdAndUpdate(
      conversation_id,
      { $pull: { admins: { $in: admins } } },
      { new: true }
    )
      .populate('admins', pp_UserDefault)
      .lean();
  }
  static async appointAdmin({ members, conversation_id }) {
    return await ConversationModel.findByIdAndUpdate(
      conversation_id,
      { $addToSet: { admins: { $each: members } } },
      { new: true }
    )
      .populate('admins', pp_UserDefault)
      .lean();
  }
  static async leaveGroupConversation({ conversation_id, user_id }) {
    return await ConversationModel.findByIdAndUpdate(
      conversation_id,
      { $pull: { members: user_id, admins: user_id } },
      { new: true }
    ).lean();
  }
  static async deleteConversation({ conversation_id }) {
    return await ConversationModel.findByIdAndDelete(conversation_id);
  }
  static async changeConversationCoverImage({ conversation_id, cover_image }) {
    return await ConversationModel.findByIdAndUpdate(conversation_id, { cover_image }, { new: true }).lean();
  }
  static async changeConversationImage({ conversation_id, image }) {
    return await ConversationModel.findByIdAndUpdate(conversation_id, { image }, { new: true }).lean();
  }
  static async deleteMemberFromConversation({ members, conversation_id }) {
    return await ConversationModel.findByIdAndUpdate(
      conversation_id,
      { $pull: { members: { $in: members } } },
      { new: true }
    ).lean();
  }
  static async addMemberToConversation({ members, conversation_id }) {
    return await ConversationModel.findByIdAndUpdate(
      conversation_id,
      { $addToSet: { members: { $each: members } } },
      { new: true }
    ).lean();
  }
  static async changeConversationName({ name, conversation_id }) {
    return await ConversationModel.findByIdAndUpdate(conversation_id, { name }, { new: true }).lean();
  }
  static async getAllConversationsByUserId({ user_id, limit, page, sort }) {
    const skip = (page - 1) * limit;
    const result = await ConversationModel.find({
      members: { $in: [user_id] }
    })
      .populate('members', pp_UserDefault)
      .populate('admins', pp_UserDefault)
      .populate('seen', pp_UserDefault)
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: pp_UserDefault
        }
      })
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
    return result || [];
  }
  static async getConversationById({ conversation_id }) {
    return await ConversationModel.findById(conversation_id)
      .populate('members', pp_UserDefault)
      .populate('admins', pp_UserDefault)
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
    } else if (type === 'group') {
      const admins = [author];
      return await ConversationModel.create({
        type,
        members,
        name,
        admins
      });
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
