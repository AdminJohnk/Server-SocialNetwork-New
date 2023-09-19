'use strict';
const { model, Schema, Types } = require('mongoose');
const { getSelectData } = require('../utils/functions');
const ObjectId = Types.ObjectId;
const { pp_UserDefault } = require('../utils/constants');

const DOCUMENT_NAME = 'ParentComment';
const COLLECTION_NAME = 'parentComments';

const ParentCommentSchema = new Schema(
  {
    post: { type: ObjectId, ref: 'Product', required: true },
    user: { type: ObjectId, ref: 'User', required: true },
    content: { type: String, default: 'text', required: true },
    type: { type: String, default: 'parent' },

    // Like
    likes: { type: [{ type: ObjectId, ref: 'User' }], default: [] },
    like_number: { type: Number, default: 0 },
    dislike_number: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const ParentCommentModel = model(DOCUMENT_NAME, ParentCommentSchema);

class ParentCommentClass {
  static async likeComment({ comment_id, post, user }) {
    // Check xem đã like hay chưa
    const isLiked = await ParentCommentModel.findOne({
      _id: comment_id,
      post,
      likes: { $elemMatch: { $eq: user } }
    });

    // Nếu đã like rồi thì bỏ like
    if (isLiked) {
      return await ParentCommentModel.findOneAndUpdate(
        { _id: comment_id, post },
        { $pull: { likes: user }, $inc: { like_number: -1 } },
        { new: true }
      );
    }
    // Nếu chưa like thì like
    return await ParentCommentModel.findOneAndUpdate(
      { _id: comment_id, post },
      { $addToSet: { likes: user }, $inc: { like_number: 1 } },
      { new: true }
    );
  }
  static async updateComment({ comment_id, post, user, content }) {
    return await ParentCommentModel.findOneAndUpdate(
      { _id: comment_id, post, user },
      { content },
      { new: true }
    );
  }
  static async deleteByID({ comment_id, post, user }) {
    return await ParentCommentModel.findOneAndDelete({
      _id: comment_id,
      post,
      user
    });
  }
  static async getAllParentComments({
    post,
    limit,
    page,
    sort,
    select = ['user', 'content', 'createdAt', 'type']
  }) {
    const skip = (page - 1) * limit;
    return await ParentCommentModel.find({ post })
      .populate('user', pp_UserDefault)
      .select(getSelectData(select))
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
  }
  static async createComment(payload) {
    return await ParentCommentModel.create(payload);
  }
  static async checkExist(select) {
    return await ParentCommentModel.findOne(select).lean();
  }
}

module.exports = {
  ParentCommentClass,
  ParentCommentModel
};
