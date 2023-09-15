'use strict';
const { model, Schema, Types } = require('mongoose');
const { PostClass } = require('./post.model');
const { getSelectData } = require('../utils');
const { pp_UserDefault } = require('../utils/variable');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'ChildComment';
const COLLECTION_NAME = 'childComments';

const ChildCommentSchema = new Schema(
  {
    post: { type: ObjectId, ref: 'Product', required: true },
    user: { type: ObjectId, ref: 'User', required: true },
    content: { type: String, default: 'text', required: true },
    parent: { type: ObjectId, ref: 'ParentComment', required: true },
    type: { type: String, default: 'child' },

    // Like
    likes: { type: [{ type: ObjectId, ref: 'User' }], default: [] },
    numlike: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const ChildCommentModel = model(DOCUMENT_NAME, ChildCommentSchema);

class ChildCommentClass {
  static async likeComment({ comment_id, post, user }) {
    // Check xem đã like hay chưa
    const isLiked = await ChildCommentModel.findOne({
      _id: comment_id,
      post,
      likes: { $elemMatch: { $eq: user } }
    });

    // Nếu đã like rồi thì bỏ like
    if (isLiked) {
      return await ChildCommentModel.findOneAndUpdate(
        { _id: comment_id, post },
        { $pull: { likes: user }, $inc: { numlike: -1 } },
        { new: true }
      );
    }
    // Nếu chưa like thì like
    return await ChildCommentModel.findOneAndUpdate(
      { _id: comment_id, post },
      { $addToSet: { likes: user }, $inc: { numlike: 1 } },
      { new: true }
    );
  }
  static async updateComment({ comment_id, post, user, content }) {
    return await ChildCommentModel.findOneAndUpdate(
      { _id: comment_id, post, user },
      { content },
      { new: true }
    );
  }
  static async deleteByParentID({ parent, post }) {
    const result = await ChildCommentModel.deleteMany({ parent, post });
    await PostClass.changeNumberPost({
      post_id: post,
      type: 'comment',
      number: -result.deletedCount
    });
    return result;
  }
  static async deleteByID({ comment_id, post, user }) {
    const result = await ChildCommentModel.findOneAndDelete({
      _id: comment_id,
      post,
      user
    });

    await PostClass.changeNumberPost({
      post_id: post,
      type: 'comment',
      number: -1
    });
    return result;
  }
  static async getAllChildByParentID({
    post,
    parent,
    limit,
    page,
    sort,
    select = ['user', 'content', 'createdAt', 'type']
  }) {
    const skip = (page - 1) * limit;
    return await ChildCommentModel.find({ post, parent })
      .populate('user', pp_UserDefault)
      .select(getSelectData(select))
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
  }
  static async createComment(payload) {
    const result = await ChildCommentModel.create(payload);
    await PostClass.changeNumberPost({
      post_id: payload.post,
      type: 'comment',
      number: 1
    });
    return result;
  }
  static async checkExist(select) {
    return await ChildCommentModel.findOne(select).lean();
  }
}

module.exports = {
  ChildCommentClass,
  ChildCommentModel
};
