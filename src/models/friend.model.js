'use strict';
const { model, Schema, Types } = require('mongoose');
const { getSelectData, unGetSelectData } = require('../utils/functions');
const { se_UserDefault, pp_UserDefault } = require('../utils/constants');

const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Friend';
const COLLECTION_NAME = 'friends';

const FriendSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      index: true,
      required: true
    },
    friends: {
      type: [ObjectId],
      ref: 'User',
      index: true,
      default: []
    },
    pendingFriends: {
      type: [ObjectId],
      ref: 'User',
      default: []
    },
    requestedFriends: {
      type: [ObjectId],
      ref: 'User',
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

FriendSchema.index({ user: 1, friend: 1 }, { unique: true });

const FriendModel = model(DOCUMENT_NAME, FriendSchema);

class FriendClass {
  static async findFriend({ user_id, key_search, limit, skip }) {
    const user = await FriendModel.findOne({ user: user_id })
      .select('friends')
      .populate({
        path: 'friends',
        select: getSelectData(se_UserDefault),
        match: {
          $or: [
            { name: { $regex: key_search, $options: 'i' } },
            { alias: { $regex: key_search, $options: 'i' } }
          ]
        },
        options: {
          limit: limit,
          skip: skip
        }
      });
    if (!user) return [];
    return user.friends;
  }
  static async getAllFriends({ user_id }) {
    const user = await FriendModel.findOne({ user: user_id })
      .select('friends')
      .populate({
        path: 'friends',
        select: getSelectData(se_UserDefault)
      });
    if (!user) return [];
    return user.friends;
  }
  static async sendFriendRequest({ user_id, friend_id }) {
    const user = await FriendModel.findOne({ user: user_id });
    if (!user) {
      const newUser = new FriendModel({
        user: user_id,
        friends: [],
        pendingFriends: [friend_id],
        requestedFriends: []
      });
      newUser.pendingFriends.push(friend_id);
      await newUser.save();
      return newUser;
    }
    if (user.friends.includes(friend_id)) return null;
    if (user.pendingFriends.includes(friend_id)) return null;
    if (user.requestedFriends.includes(friend_id)) return null;
    user.pendingFriends.push(friend_id);
    await user.save();
    return user;
  }
  static async acceptFriendRequest({ user_id, friend_id }) {
    const user = await FriendModel.findOne({ user: user_id });
    if (!user) return null;
    if (!user.pendingFriends.includes(friend_id)) return null;
    user.pendingFriends.pull(friend_id);
    user.friends.push(friend_id);
    await user.save();
    return user;
  }
}

module.exports = {
  FriendModel,
  FriendClass
};
