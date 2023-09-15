'use strict';

const { model, Schema, Types } = require('mongoose');
const { unGetSelectData } = require('../utils');
const { PostModel, PostClass } = require('./post.model');
const { pp_UserDefault } = require('../utils/variable');
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
    let numLike = 1;
    if (foundLike) {
      await LikeModel.deleteOne(foundLike);
      numLike = -1;
    } else await LikeModel.create(payload);

    return await PostClass.changeNumberPost({
      post_id: payload.post,
      type: 'like',
      number: numLike
    });
  }
}

//Export the model
module.exports = {
  LikeClass,
  LikeModel
};
