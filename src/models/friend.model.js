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
    requestsSent: {
      type: [ObjectId],
      ref: 'User',
      default: []
    },
    requestsReceived: {
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
    let [user, friend] = await Promise.all([
      FriendModel.findOne({ user: user_id }),
      FriendModel.findOne({ user: friend_id })
    ]);

    if (!friend) {
      friend = new FriendModel({
        user: friend_id,
        friends: [],
        requestsSent: [],
        requestsReceived: []
      });
      await friend.save();
    }

    if (!user) {
      user = new FriendModel({
        user: user_id,
        friends: [],
        requestsSent: [],
        requestsReceived: []
      });
      await user.save();
    }

    if (
      user.friends.includes(friend_id) ||
      user.requestsSent.includes(friend_id) ||
      user.requestsReceived.includes(friend_id)
    ) {
      return null;
    }

    user.requestsSent.push(friend_id);
    friend.requestsReceived.push(user_id);

    await Promise.all([user.save(), friend.save()]);

    return user;
  }
  static async cancelFriendRequest({ user_id, friend_id }) {
    const [user, friend] = await Promise.all([
      FriendModel.findOne({ user: user_id }),
      FriendModel.findOne({ user: friend_id })
    ]);

    if (!user || !friend) return null;
    if (!user.requestsSent.includes(friend_id) || !friend.requestsReceived.includes(user_id)) return null;

    friend.requestsReceived.pull(user_id);
    user.requestsSent.pull(friend_id);

    await Promise.all([friend.save(), user.save()]);

    return user;
  }
  static async acceptFriendRequest({ user_id, friend_id }) {
    const [user, friend] = await Promise.all([
      FriendModel.findOne({ user: user_id }),
      FriendModel.findOne({ user: friend_id })
    ]);

    if (!user || !friend) return null;
    if (!friend.requestsSent.includes(user_id) || !user.requestsReceived.includes(friend_id)) return null;

    friend.requestsSent.pull(user_id);
    friend.friends.push(user_id);
    user.requestsReceived.pull(friend_id);
    user.friends.push(friend_id);

    await Promise.all([friend.save(), user.save()]);

    return user;
  }
  static async declineFriendRequest({ user_id, friend_id }) {
    const [user, friend] = await Promise.all([
      FriendModel.findOne({ user: user_id }),
      FriendModel.findOne({ user: friend_id })
    ]);

    if (!user || !friend) return null;
    if (!friend.requestsSent.includes(user_id) || !user.requestsReceived.includes(friend_id)) return null;

    friend.requestsSent.pull(user_id);
    user.requestsReceived.pull(friend_id);

    await Promise.all([friend.save(), user.save()]);

    return user;
  }
  static async deleteFriend({ user_id, friend_id }) {
    const [user, friend] = await Promise.all([
      FriendModel.findOne({ user: user_id }),
      FriendModel.findOne({ user: friend_id })
    ]);

    if (!user || !friend) return null;
    if (!user.friends.includes(friend_id) || !friend.friends.includes(user_id)) return null;

    friend.friends.pull(user_id);
    user.friends.pull(friend_id);

    await Promise.all([friend.save(), user.save()]);

    return user;
  }
  static async getRequestsSent({ user_id }) {
    const user = await FriendModel.findOne({ user: user_id });
    if (!user) return [];
    
    return user.requestsSent;
  }
  static async getRequestsReceived({ user_id }) {
    const user = await FriendModel.findOne({ user: user_id });
    if (!user) return [];

    return user.requestsReceived;
  }
}

module.exports = {
  FriendModel,
  FriendClass
};
