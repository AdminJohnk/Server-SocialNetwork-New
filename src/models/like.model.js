'use strict';

const { model, Schema, Types } = require('mongoose');
const { pp_UserDefault } = require('../utils/constants');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Like';
const COLLECTION_NAME = 'likes';

var LikeSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User', required: true },
    post: { type: ObjectId, ref: 'Post', required: true },
    owner_post: { type: ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

LikeSchema.index({ user: 1, post: 1 }, { unique: true });

const LikeModel = model(DOCUMENT_NAME, LikeSchema);

class LikeClass {
  static async getAllUserLikePost({ post, owner_post, limit, skip, sort }) {
    return await LikeModel.find({ post, owner_post })
      .populate('user', pp_UserDefault)
      .select('user')
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
  }
  static async likePost({ user, post, owner_post }) {
    const foundLike = await LikeModel.findOne({
      user: user,
      post: post
    });
    let numLike = 1;
    if (foundLike) {
      Promise.resolve(LikeModel.deleteOne(foundLike));
      numLike = -1;
    } else LikeModel.create({ user, post, owner_post });

    return {
      numLike
    };
  }
  static async checkExist(select) {
    return await LikeModel.findOne(select).lean();
  }
}

//Export the model
module.exports = {
  LikeClass,
  LikeModel
};
