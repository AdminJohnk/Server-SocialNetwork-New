'use strict';

import { model, Schema, Types } from 'mongoose';
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Conversation';
const COLLECTION_NAME = 'conversations';

import { pp_UserDefault, se_UserDefaultForPost } from '../utils/constants.js';
import { MessageModel } from './message.model.js';
import { getSelectData } from '../utils/functions.js';

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
    creator: { type: ObjectId, ref: 'User' },
    name: String,
    image: String,
    cover_image: String
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

ConversationSchema.index({ members: 1, updatedAt: -1 });

const ConversationModel = model(DOCUMENT_NAME, ConversationSchema);

class ConversationClass {
  static async updateLastMessage({ conversation_id, message_id }) {
    return await ConversationModel.findByIdAndUpdate(
      conversation_id,
      { lastMessage: message_id, seen: [] },
      { new: true }
    )
      .populate('members', pp_UserDefault)
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: pp_UserDefault
        }
      })
      .lean();
  }
  static async getAllUsersUsedToChatWith({ user_id, sort }) {
    const conversations = await ConversationModel.find({
      members: { $in: [user_id] }
    });

    const users = await ConversationModel.aggregate([
      { $match: { _id: { $in: conversations.map((item) => item._id) } } },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'members',
          pipeline: [
            { $match: { _id: { $ne: user_id } } },
            { $project: getSelectData(se_UserDefaultForPost) }
          ]
        }
      },
      { $unwind: '$members' },
      { $group: { _id: '$members._id', members: { $first: '$members' } } },
      { $replaceRoot: { newRoot: '$members' } },
      { $sort: sort }
    ]);

    return users || [];
  }
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
    const conversation = await ConversationModel.findById(conversation_id).lean();
    let update;
    if (conversation.creator === user_id) {
      update = {
        $pull: { members: user_id, admins: user_id },
        $set: { creator: null }
      };
    } else {
      update = {
        $pull: { members: user_id, admins: user_id }
      };
    }
    return await ConversationModel.findByIdAndUpdate(conversation_id, update, { new: true })
      .populate('members', pp_UserDefault)
      .lean();
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
    )
      .populate('members', pp_UserDefault)
      .lean();
  }
  static async addMemberToConversation({ members, conversation_id }) {
    return await ConversationModel.findByIdAndUpdate(
      conversation_id,
      { $addToSet: { members: { $each: members } } },
      { new: true }
    )
      .populate('members', pp_UserDefault)
      .populate('seen', pp_UserDefault)
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: pp_UserDefault
        }
      })
      .lean();
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
  static async getConversationsByMessageTypes({ user_id, limit, page, sort }) {
    const skip = (page - 1) * limit;
    const conversations = await ConversationModel.find({
      members: { $in: [user_id] }
    });

    const messages = await MessageModel.find({
      conversation_id: { $in: conversations.map((item) => item._id) },
      type: { $in: ['voice', 'video'] }
    })
      .populate('sender', pp_UserDefault)
      .populate({ path: 'conversation_id', populate: { path: 'members', select: pp_UserDefault } })
      .sort(sort)
      .skip(skip)
      .lean();

    return messages || [];
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
        const result = await ConversationModel.create({
          type,
          members,
          creator: author
        });
        return await result.populate('members', pp_UserDefault);
      } else {
        return await foundConversation.populate('members', pp_UserDefault);
      }
    } else if (type === 'group') {
      const admins = [author];
      const result = await ConversationModel.create({
        type,
        members,
        name,
        admins,
        creator: author
      });

      return await result.populate('members', pp_UserDefault);
    }
  }
  static async checkExist(select) {
    return await ConversationModel.findOne(select);
  }
}

export { ConversationClass, ConversationModel };
