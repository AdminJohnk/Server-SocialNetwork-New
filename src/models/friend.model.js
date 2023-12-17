'use strict';
const { model, Schema, Types } = require('mongoose');
import { UserModel } from './user.model';
import { getSelectData, unGetSelectData } from '../utils/functions';
import { se_UserDefault, pp_UserDefault } from '../utils/constants';

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
  static async sendFriendRequest({ user_id, friend_id }) {
    const ids = [user_id, friend_id];

    for (const id of ids) {
      let user = await FriendModel.findOne({ user: id });

      if (!user) {
        user = new FriendModel({ user: id, pendingFriends: [id === user_id ? friend_id : user_id] });
        await user.save();
      } else {
        await FriendModel.findByIdAndUpdate(user._id, {
          $addToSet: { pendingFriends: id === user_id ? friend_id : user_id }
        });
      }
    }

    return true;
  }
  static async acceptFriendRequest({ user_id, friend_id }) {
    const ids = [user_id, friend_id];

    for (const id of ids) {
      let user = await FriendModel.findOne({ user: id });

      if (!user) {
        user = new FriendModel({ user: id, friends: [id === user_id ? friend_id : user_id] });
        await user.save();
      } else {
        await FriendModel.findByIdAndUpdate(user._id, {
          $addToSet: { friends: id === user_id ? friend_id : user_id }
        });
      }
    }

    return true;
  }
}

module.exports = {
  FriendModel,
  FriendClass
};
