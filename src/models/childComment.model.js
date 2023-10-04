'use strict';
const { model, Schema, Types } = require('mongoose');
const { getSelectData, unGetSelectData } = require('../utils/functions');
const { pp_UserDefault } = require('../utils/constants');
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
    dislikes: { type: [{ type: ObjectId, ref: 'User' }], default: [] },

    like_number: { type: Number, default: 0 },
    dislike_number: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const ChildCommentModel = model(DOCUMENT_NAME, ChildCommentSchema);

class ChildCommentClass {
  static async dislikeComment({ comment_id, post, user }) {
    const isDisliked = await this.checkExist({
      _id: comment_id,
      post,
      dislikes: { $elemMatch: { $eq: user } }
    });

    let dislike_number = 1;

    // Nếu đã dislike rồi thì bỏ dislike
    if (isDisliked) {
      dislike_number = -1;
      Promise.resolve(
        ChildCommentModel.findOneAndUpdate(
          { _id: comment_id, post },
          { $pull: { dislikes: user }, $inc: { dislike_number: -1 } },
          { new: true }
        )
      );
    } else {
      // Nếu chưa dislike thì dislike
      Promise.resolve(
        ChildCommentModel.findOneAndUpdate(
          { _id: comment_id, post },
          { $addToSet: { dislikes: user }, $inc: { dislike_number: 1 } },
          { new: true }
        )
      );
    }
    return {
      dislike_number
    };
  }
  static async likeComment({ comment_id, post, user }) {
    const isLiked = await this.checkExist({
      _id: comment_id,
      post,
      likes: { $elemMatch: { $eq: user } }
    });

    let like_number = 1;

    // Nếu đã like rồi thì bỏ like
    if (isLiked) {
      like_number = -1;
      Promise.resolve(
        ChildCommentModel.findOneAndUpdate(
          { _id: comment_id, post },
          { $pull: { likes: user }, $inc: { like_number: -1 } },
          { new: true }
        )
      );
    } else {
      // Nếu chưa like thì like
      Promise.resolve(
        ChildCommentModel.findOneAndUpdate(
          { _id: comment_id, post },
          { $addToSet: { likes: user }, $inc: { like_number: 1 } },
          { new: true }
        )
      );
    }
    return {
      like_number
    };
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
    return {
      deletedCount: result.deletedCount
    };
  }
  static async deleteByID({ comment_id, post, user }) {
    return ChildCommentModel.findOneAndDelete({
      _id: comment_id,
      post,
      user
    });
  }
  static async getAllChildByParentID({
    post,
    parent,
    limit,
    page,
    sort,
    unselect = ['likes', 'dislikes']
  }) {
    const skip = (page - 1) * limit;
    return await ChildCommentModel.find({ post, parent })
      .populate('user', pp_UserDefault)
      .select(unGetSelectData(unselect))
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
  }
  static async createComment(payload) {
    return await ChildCommentModel.create(payload);
  }
  static async checkExist(select) {
    return await ChildCommentModel.findOne(select).lean();
  }
}

module.exports = {
  ChildCommentClass,
  ChildCommentModel
};
