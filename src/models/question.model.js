'use strict';

import { model, mongo, Mongoose, Schema, Types } from 'mongoose';
import { pp_UserDefault, pp_UserMore } from '../utils/constants.js';
import { FriendClass } from './friend.model.js';
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Question';
const COLLECTION_NAME = 'questions';

const QuestionSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    problem: { type: String, required: true },
    expect: { type: String, required: true },
    hashtags: { type: [String], required: true },
    view: { type: Number, default: 0 },
    vote_up: { type: [ObjectId], ref: 'User', default: [] },
    vote_down: { type: [ObjectId], ref: 'User', default: [] },
    vote_score: { type: Number, default: 0 },
    update_at: { type: Date, default: Date.now },
    comment: {
      type: [
        {
          user: { type: ObjectId, ref: 'User', required: true },
          content: { type: String, required: true }
        }
      ],
      default: []
    },
    answers: {
      type: [
        {
          user: { type: ObjectId, ref: 'User', required: true },
          content: { type: String, required: true },
          like: [{ type: ObjectId, ref: 'User', default: [] }],
          comment: {
            type: [
              {
                user: { type: ObjectId, ref: 'User', required: true },
                content: { type: String, required: true }
              }
            ],
            default: []
          },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const QuestionModel = model(DOCUMENT_NAME, QuestionSchema);

class QuestionClass {
  static async deleteQuestion(question_id) {
    return await QuestionModel.findByIdAndDelete(question_id);
  }
  static async updateQuestion({
    question_id,
    title,
    problem,
    expect,
    hashtags
  }) {
    return await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { title, problem, expect, hashtags },
      { new: true }
    ).lean();
  }
  static async voteQuestion({ question_id, type, user }) {
    let question;
    if (type === 'up') {
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id },
        { $pull: { vote_down: user }, $push: { vote_up: user } },
        { new: true }
      );
    } else if (type === 'down') {
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id },
        { $pull: { vote_up: user }, $push: { vote_down: user } },
        { new: true }
      );
    } else if (type === 'cancel') {
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id },
        { $pull: { vote_up: user, vote_down: user } },
        { new: true }
      );
    }

    // vote_score
    const vote_score = question.vote_up.length - question.vote_down.length;
    await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { $set: { vote_score } }
    );
    return true;
  }
  static async viewQuestion({ question_id }) {
    return await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { $inc: { view: 1 } },
      { new: true }
    ).lean();
  }
  static async getQuestionById(question_id) {
    return await QuestionModel.findById(question_id)
      .populate('user', pp_UserMore)
      .lean();
  }
  static async createQuestion({ user, title, problem, expect, hashtags }) {
    return await QuestionModel.create({
      user,
      title,
      problem,
      expect,
      hashtags
    });
  }

  //   static async deleteReplyComment({
  //     series_id,
  //     post_id,
  //     comment_id,
  //     child_id
  //   }) {
  //     return await SeriesModel.findOneAndUpdate(
  //       {
  //         _id: series_id,
  //         'posts._id': post_id,
  //         'posts.comments._id': comment_id
  //       },
  //       {
  //         $pull: {
  //           'posts.$.comments.$[outer].child': { _id: child_id }
  //         }
  //       },
  //       { arrayFilters: [{ 'outer._id': comment_id }], new: true }
  //     ).lean();
  //   }

  //   static async updateComment({ series_id, post_id, comment_id, content }) {
  //     return await SeriesModel.findOneAndUpdate(
  //       {
  //         _id: series_id,
  //         'posts._id': post_id,
  //         'posts.comments._id': comment_id
  //       },
  //       {
  //         $set: {
  //           'posts.$.comments.$[outer].content': content
  //         }
  //       },
  //       { arrayFilters: [{ 'outer._id': comment_id }], new: true }
  //     ).lean();
  //   }

  //   static async updatePost({
  //     series_id,
  //     id,
  //     title,
  //     description,
  //     content,
  //     cover_image,
  //     visibility,
  //     read_time
  //   }) {
  //     return await SeriesModel.findOneAndUpdate(
  //       { _id: series_id, 'posts._id': id },
  //       {
  //         $set: {
  //           'posts.$.title': title,
  //           'posts.$.description': description,
  //           'posts.$.content': content,
  //           'posts.$.cover_image': cover_image,
  //           'posts.$.visibility': visibility,
  //           'posts.$.read_time': read_time
  //         }
  //       },
  //       { new: true }
  //     ).lean();
  //   }

  //   static async getSeriesById({ series_id, user, me_id }) {
  //     const condition = { _id: series_id };

  //     if (me_id !== user) {
  //       const check = FriendClass.isFriend({ user: me_id, friend: user });
  //       if (!check) {
  //         condition.visibility = 'public';
  //       } else {
  //         condition.visibility = { $ne: 'private' };
  //       }
  //     }

  //     return await SeriesModel.findOne(condition)
  //       .populate('user', pp_UserMore)
  //       .populate('posts.comments.user', pp_UserDefault)
  //       .populate('posts.comments.child.user', pp_UserDefault)
  //       .populate('posts.comments.child.like', pp_UserDefault)
  //       .populate('posts.comments.like', pp_UserDefault)
  //       .populate('posts.likes', pp_UserDefault)
  //       .populate('posts.saves', pp_UserDefault)
  //       .populate('reviews.user', pp_UserDefault)
  //       .lean();
  //   }
  //   static async getAllSeries({ user, limit, skip, sort, me_id }) {
  //     const condition = { user };
  //     if (me_id !== user) {
  //       const check = FriendClass.isFriend({ user: me_id, friend: user });
  //       if (!check) {
  //         condition.visibility = 'public';
  //       } else {
  //         condition.visibility = { $ne: 'private' };
  //       }
  //     }
  //     return await SeriesModel.find(condition)
  //       .skip(skip)
  //       .limit(limit)
  //       .sort(sort)
  //       .lean();
  //   }
  //   static async createSeries({
  //     user,
  //     title,
  //     description,
  //     introduction,
  //     level,
  //     cover_image,
  //     visibility
  //   }) {
  //     return await SeriesModel.create({
  //       user,
  //       title,
  //       description,
  //       introduction,
  //       level,
  //       cover_image,
  //       visibility
  //     });
  //   }

  static async checkExist(select) {
    return await QuestionModel.findOne(select).lean();
  }
}

//Export the model
export { QuestionClass, QuestionModel };
