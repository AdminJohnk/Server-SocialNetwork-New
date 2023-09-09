'use strict';

const { model, Schema, Types, get } = require('mongoose');
const { getSelectData } = require('../utils');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Follow';
const COLLECTION_NAME = 'follows';

var FollowSchema = new Schema(
  {
    user_id: { type: ObjectId, ref: 'User' },
    follower_ids: {
      type: [{ type: ObjectId, ref: 'User', default: [] }]
    },
    following_ids: {
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
  static async followUser({ meId, user_id }) {
    const isFollowed = await FollowModel.findOne({
      user_id: meId,
      following_ids: { $in: [user_id] }
    });
    if (isFollowed) {
      await FollowClass.removeFollow({ meId, user_id });
    } else {
      await FollowClass.addFollow({ meId, user_id });
    }
  }
  static async addFollow({ meId, user_id }) {
    // Following
    const updateSet1 = { $addToSet: { following_ids: user_id } };
    const options1 = { upsert: true };
    await FollowModel.findOneAndUpdate({ user_id: meId }, updateSet1, options1);

    // Follower
    const updateSet2 = { $addToSet: { follower_ids: meId } };
    const options2 = { upsert: true };
    await FollowModel.findOneAndUpdate(
      { user_id: user_id },
      updateSet2,
      options2
    );
  }
  static async removeFollow({ meId, user_id }) {
    // Following
    const updateSet1 = { $pull: { following_ids: user_id } };
    await FollowModel.findOneAndUpdate({ user_id: meId }, updateSet1);

    // Follower
    const updateSet2 = { $pull: { follower_ids: meId } };
    await FollowModel.findOneAndUpdate({ user_id: user_id }, updateSet2);
  }
  static async getListFollowersByUserId({ user_id, limit, skip, sort }) {
    return await this.getListFollowByUserId({
      user_id,
      limit,
      skip,
      sort,
      select: ['follower_ids'],
      populate: 'follower_ids'
    });
  }
  static async getListFollowingByUserId({ user_id, limit, skip, sort }) {
    return await this.getListFollowByUserId({
      user_id,
      limit,
      skip,
      sort,
      select: ['following_ids'],
      populate: 'following_ids'
    });
  }
  static getListFollowByUserId = async ({
    user_id,
    limit,
    skip,
    sort,
    select,
    populate
  }) => {
    return await FollowModel.findOne({ user_id })
      .select(getSelectData(select))
      .populate(populate, '_id name email user_image')
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
