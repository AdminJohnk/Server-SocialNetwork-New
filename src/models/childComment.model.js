'use strict';
import { model, Schema, Types } from 'mongoose';
import { getSelectData, unGetSelectData } from '../utils/functions.js';
import { pp_UserDefault, se_UserDefault } from '../utils/constants.js';
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
      await Promise.resolve(
        ChildCommentModel.findOneAndUpdate(
          { _id: comment_id, post },
          { $pull: { dislikes: user }, $inc: { dislike_number: -1 } },
          { new: true }
        )
      );
    } else {
      // Nếu chưa dislike thì dislike
      await Promise.resolve(
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
      await Promise.resolve(
        ChildCommentModel.findOneAndUpdate(
          { _id: comment_id, post },
          { $pull: { likes: user }, $inc: { like_number: -1 } },
          { new: true }
        )
      );
    } else {
      // Nếu chưa like thì like
      await Promise.resolve(
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
    user,
    post,
    parent,
    limit,
    page,
    sort,
    unselect = ['like_number', 'dislike_number']
  }) {
    const skip = (page - 1) * limit;
    // return await ChildCommentModel.find({ post, parent })
    //   .populate('user', pp_UserDefault)
    //   .select(unGetSelectData(unselect))
    //   .skip(skip)
    //   .limit(limit)
    //   .sort(sort)
    //   .lean();

    return await ChildCommentModel.aggregate([
      {
        $match: {
          post: new ObjectId(post),
          parent: new ObjectId(parent)
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
      { $skip: skip }
      // { $limit: limit }
    ]);
  }
  static async createComment(payload) {
    return await ChildCommentModel.create(payload);
  }
  static async checkExist(select) {
    return await ChildCommentModel.findOne(select).lean();
  }
  // ================= ADMIN =================
  static async getAllChildComments_admin({ post, limit, page, sort }) {
    const skip = (page - 1) * limit;
    return await ChildCommentModel.find({ post })
      .skip(skip)
      .limit(limit)
      .populate('user', pp_UserDefault)
      .sort(sort)
      .lean();
  }
  static async updateComment_admin({ comment_id, content }) {
    return await ChildCommentModel.findByIdAndUpdate(comment_id, { content }, { new: true });
  }
  static async deleteComment_admin({ comment_id }) {
    return await ChildCommentModel.findByIdAndDelete(comment_id);
  }
  static async getAllChildComments_admin({ parent, limit, page, sort }) {
    const skip = (page - 1) * limit;
    return await ChildCommentModel.find({ parent })
      .skip(skip)
      .limit(limit)
      .populate('user', pp_UserDefault)
      .sort(sort)
      .lean();
  }
}

export { ChildCommentClass, ChildCommentModel };
