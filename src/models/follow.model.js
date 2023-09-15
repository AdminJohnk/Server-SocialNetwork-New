'use strict';

const { model, Schema, Types, get } = require('mongoose');
const { getSelectData } = require('../utils');
const { pp_UserDefault } = require('../utils/variable');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Follow';
const COLLECTION_NAME = 'follows';

// user_id follower_ids following_ids

var FollowSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User' },
    followers: {
      type: [{ type: ObjectId, ref: 'User', default: [] }]
    },
    followings: {
      type: [{ type: ObjectId, ref: 'User', default: [] }]
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const FollowModel = model(DOCUMENT_NAME, FollowSchema);

class FollowClass {
  static async followUser({ meId, user }) {
    const isFollowed = await FollowModel.findOne({
      user: meId,
      followings: { $in: [user] }
    });
    if (isFollowed) {
      await FollowClass.removeFollow({ meId, user });
    } else {
      await FollowClass.addFollow({ meId, user });
    }
  }
  static async addFollow({ meId, user }) {
    // Following
    const updateSet1 = { $addToSet: { followings: user } };
    const options1 = { upsert: true };
    await FollowModel.findOneAndUpdate({ user: meId }, updateSet1, options1);

    // Follower
    const updateSet2 = { $addToSet: { followers: meId } };
    const options2 = { upsert: true };
    await FollowModel.findOneAndUpdate(
      { user },
      updateSet2,
      options2
    );
  }
  static async removeFollow({ meId, user }) {
    // Following
    const updateSet1 = { $pull: { followings: user } };
    await FollowModel.findOneAndUpdate({ user: meId }, updateSet1);

    // Follower
    const updateSet2 = { $pull: { followers: meId } };
    await FollowModel.findOneAndUpdate({ user }, updateSet2);
  }
  static async getListFollowersByUserId({ user, limit, skip, sort }) {
    return await this.getListFollowByUserId({
      user,
      limit,
      skip,
      sort,
      select: ['followers'],
      populate: 'followers'
    });
  }
  static async getListFollowingByUserId({ user, limit, skip, sort }) {
    return await this.getListFollowByUserId({
      user,
      limit,
      skip,
      sort,
      select: ['followings'],
      populate: 'followings'
    });
  }
  static getListFollowByUserId = async ({
    user,
    limit,
    skip,
    sort,
    select,
    populate
  }) => {
    return await FollowModel.findOne({ user })
      .select(getSelectData(select))
      .populate(populate, pp_UserDefault)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
  };
}

//Export the model
module.exports = {
  FollowClass,
  FollowModel
};
