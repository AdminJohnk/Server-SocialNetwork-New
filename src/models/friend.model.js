'use strict';
const { model, Schema, Types } = require('mongoose');
const { getSelectData, unGetSelectData } = require('../utils/functions');
const { pp_UserDefault, se_UserDefault } = require('../utils/constants');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Friend';
const COLLECTION_NAME = 'friends';

const FriendSchema = new Schema(
  {
    user_id: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    friend_id: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

FriendSchema.index({ user_id: 1, friend_id: 1 }, { unique: true });

const FriendModel = model(DOCUMENT_NAME, FriendSchema);

class FriendClass {
  static async checkExist({ user_id, friend_id }) {
    return await FriendModel.findOne({
      user_id,
      friend_id
    });
  }
  static async sendFriendRequest({ user_id, friend_id }) {
    const friend = await FriendModel.create({
      user_id,
      friend_id
    });

    return friend;
  }
  static async acceptFriend({ user_id, friend_id }) {
    const friend = await FriendModel.findOneAndUpdate(
      {
        user_id,
        friend_id
      },
      { status: 'accepted' },
      { new: true }
    );

    return friend;
  }
  static async deleteFriend({ user_id, friend_id }) {
    const friend = await FriendModel.findOneAndDelete({
      user_id,
      friend_id
    });

    return friend;
  }
  static async getFriend({ user_id, friend_id }) {
    const friend = await FriendModel.findOne({
      user_id,
      friend_id
    });

    return friend;
  }
  static async getFriends({ user_id }) {
    const friends = await FriendModel.find({
      user_id,
      status: 'accepted'
    });

    return friends;
  }
  static async getFriendRequests({ user_id }) {
    const friends = await FriendModel.find({
      friend_id: user_id,
      status: 'pending'
    });

    return friends;
  }
}

module.exports = {
  FriendModel,
  FriendClass
};
