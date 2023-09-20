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
  static async likePost(payload) {
    const foundLike = await LikeModel.findOne({
      user: payload.user,
      post: payload.post
    });
    let like_number = 1;
    let result;
    if (foundLike) {
      result = await LikeModel.deleteOne(foundLike);
      like_number = -1;
    } else result = await LikeModel.create(payload);
    return {
      like_number,
      result
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
