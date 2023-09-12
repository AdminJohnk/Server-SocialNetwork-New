'use strict';
const { model, Schema, Types } = require('mongoose');
const { PostClass } = require('./post.model');
const { getSelectData } = require('../utils');
const ObjectId = Types.ObjectId;
const { ChildCommentClass } = require('../models/childComment.model');

const DOCUMENT_NAME = 'ParentComment';
const COLLECTION_NAME = 'parentComments';

const ParentCommentSchema = new Schema(
  {
    post: { type: ObjectId, ref: 'Product', required: true },
    user: { type: ObjectId, ref: 'User', required: true },
    content: { type: String, default: 'text', required: true },
    type: { type: String, default: 'parent' }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const ParentCommentModel = model(DOCUMENT_NAME, ParentCommentSchema);

class ParentCommentClass {
  static async updateComment({ comment_id, post, user, content }) {
    return await ParentCommentModel.findOneAndUpdate(
      { _id: comment_id, post, user },
      { content },
      { new: true }
    );
  }
  static async deleteByID({ comment_id, post, user }) {
    const result = await ParentCommentModel.findOneAndDelete({
      _id: comment_id,
      post,
      user
    });
    await ChildCommentClass.deleteByParentID({ parent: comment_id, post });
    await await PostClass.changeNumberPost({
      post_id: post,
      type: 'comment',
      number: -1
    });
    return result;
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
      .populate('user', '_id name email user_image')
      .select(getSelectData(select))
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
  }
  static async createComment(payload) {
    const result = await ParentCommentModel.create(payload);
    await PostClass.changeNumberPost({
      post_id: payload.post,
      type: 'comment',
      number: 1
    });
    return result;
  }
  static async checkExist(select) {
    return await ParentCommentModel.findOne(select).lean();
  }
}

module.exports = {
  ParentCommentClass,
  ParentCommentModel
};
