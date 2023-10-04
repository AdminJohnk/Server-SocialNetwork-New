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
    dislikes: { type: [{ type: ObjectId, ref: 'User' }], default: [] },

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
        ParentCommentModel.findOneAndUpdate(
          { _id: comment_id, post },
          { $pull: { dislikes: user }, $inc: { dislike_number: -1 } },
          { new: true }
        )
      );
    } else {
      // Nếu chưa dislike thì dislike
      Promise.resolve(
        ParentCommentModel.findOneAndUpdate(
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
        ParentCommentModel.findOneAndUpdate(
          { _id: comment_id, post },
          { $pull: { likes: user }, $inc: { like_number: -1 } },
          { new: true }
        )
      );
    } else {
      // Nếu chưa like thì like
      Promise.resolve(
        ParentCommentModel.findOneAndUpdate(
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
