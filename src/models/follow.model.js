'use strict';

const { model, Schema, Types, get } = require('mongoose');
const { getSelectData } = require('../utils/functions');
const { pp_UserDefault } = require('../utils/constants');
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
  static async followUser({ me_id, user }) {
    const isFollowed = await FollowClass.checkExist({
      user: me_id,
      followings: { $in: [user] }
    });
    let numFollow = 1;
    if (isFollowed) {
      FollowClass.removeFollow({ me_id, user });
      numFollow = -1; 
    } else {
      FollowClass.addFollow({ me_id, user });
    }
    return {
      numFollow
    };
  }
  static async addFollow({ me_id, user }) {
    // Following
    const updateSet1 = { $addToSet: { followings: user } };
    const options1 = { upsert: true };
    await FollowModel.findOneAndUpdate(
      { user: me_id },
      updateSet1,
      options1
    ).lean();

    // Follower
    const updateSet2 = { $addToSet: { followers: me_id } };
    const options2 = { upsert: true };
    await FollowModel.findOneAndUpdate({ user }, updateSet2, options2).lean();
  }
  static async removeFollow({ me_id, user }) {
    // Following
    const updateSet1 = { $pull: { followings: user } };
    await FollowModel.findOneAndUpdate({ user: me_id }, updateSet1);

    // Follower
    const updateSet2 = { $pull: { followers: me_id } };
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
    console.log({
      user,
      limit,
      skip,
      sort,
      select,
      populate
    });
    const result = await FollowModel.findOne({ user })
      .select(getSelectData(select))
      .populate(populate, pp_UserDefault)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
    return !result ? [] : result[select[0]];
  };
  static async checkExist(select) {
    return await FollowModel.findOne(select).lean();
  }
}

//Export the model
module.exports = {
  FollowClass,
  FollowModel
};
