'use strict';
const { model, Schema, Types } = require('mongoose');
const { getSelectData, unGetSelectData } = require('../utils/functions');
const ObjectId = Types.ObjectId;
const { pp_UserDefault, se_UserDefault } = require('../utils/constants');

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
    dislike_number: { type: Number, default: 0 },
    child_number: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const ParentCommentModel = model(DOCUMENT_NAME, ParentCommentSchema);

class ParentCommentClass {
  // type = ['child']
  static async changeNumberComment({ comment_id, type, number }) {
    let stringUpdate = type + '_number';
    return await ParentCommentModel.findByIdAndUpdate(
      comment_id,
      {
        $inc: {
          [stringUpdate]: number
        }
      },
      { new: true }
    ).lean();
  }
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
    user,
    post,
    limit,
    page,
    sort,
    unselect = ['likes', 'dislikes']
  }) {
    const skip = (page - 1) * limit;
    // return await ParentCommentModel.find({ post })
    //   .populate('user', pp_UserDefault)
    //   .select(unGetSelectData(unselect))
    //   .skip(skip)
    //   .limit(limit)
    //   .sort(sort)
    //   .lean();

    return await ParentCommentModel.aggregate([
      {
        $match: {
          post: new ObjectId(post)
        }
      },
      {
        $addFields: {
          is_liked: { $in: [new ObjectId(user), '$likes'] },
          is_disliked: { $in: [new ObjectId(user), '$dislikes'] }
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { user_id: '$user' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$user_id'] } } },
            { $project: getSelectData(se_UserDefault) }
          ],
          as: 'user'
        }
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$user', 0] }
        }
      },
      { $project: { ...unGetSelectData(unselect) } },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ]);
  }
  static async createComment(payload) {
    return await ParentCommentModel.create(payload);
  }
  static async checkExist(select) {
    return await ParentCommentModel.findOne(select).lean();
  }
  // ================= ADMIN =================
  static async getAllParentComments_admin({ post, limit, page, sort }) {
    const skip = (page - 1) * limit;
    return await ParentCommentModel.find({ post })
      .skip(skip)
      .limit(limit)
      .populate('user', pp_UserDefault)
      .sort(sort)
      .lean();
  }
  static async updateComment_admin({ comment_id, content }) {
    return await ParentCommentModel.findByIdAndUpdate(
      comment_id,
      { content },
      { new: true }
    );
  }
  static async deleteComment_admin({ comment_id }) {
    return await ParentCommentModel.findByIdAndDelete(comment_id);
  }
  
}

module.exports = {
  ParentCommentClass,
  ParentCommentModel
};
