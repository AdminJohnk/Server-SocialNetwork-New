'use strict';

import { model, Schema, Types } from 'mongoose';
import { pp_UserDefault, pp_UserMore } from '../utils/constants.js';
import { text } from 'stream/consumers';
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Question';
const COLLECTION_NAME = 'questions';

const QuestionSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    problem: { type: String, required: true },
    expect: { type: String, required: true },
    text: { type: String, required: true },
    hashtags: { type: [String], required: true },
    view: { type: Number, default: 0 },
    vote_up: { type: [ObjectId], ref: 'User', default: [] },
    vote_down: { type: [ObjectId], ref: 'User', default: [] },
    vote_score: { type: Number, default: 0 },
    save: { type: [ObjectId], ref: 'User', default: [] },
    update_at: { type: Date, default: Date.now },
    comment: {
      type: [
        {
          user: { type: ObjectId, ref: 'User', required: true },
          content: { type: String, required: true },
          vote: [{ type: ObjectId, ref: 'User', default: [] }],
          createdAt: { type: Date, default: Date.now }
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
          vote_up: { type: [ObjectId], ref: 'User', default: [] },
          vote_down: { type: [ObjectId], ref: 'User', default: [] },
          vote_score: { type: Number, default: 0 },
          comment: {
            type: [
              {
                user: { type: ObjectId, ref: 'User', required: true },
                content: { type: String, required: true },
                vote: [{ type: ObjectId, ref: 'User', default: [] }],
                createdAt: { type: Date, default: Date.now }
              }
            ],
            default: []
          },
          update_at: { type: Date, default: Date.now },
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
  static async getAllTags() {
    
  }
  static async getNumberQuestions() {
    return await QuestionModel.countDocuments();
  }
  static async getAllQuestions({ limit, skip }) {
    return await QuestionModel.aggregate([
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          title: 1,
          problem: 1,
          hashtags: 1,
          text: 1,
          user: { _id: 1, name: 1, user_image: 1 },
          vote_score: 1,
          view: 1,
          answer_number: { $size: '$answers' },
          createdAt: 1
        }
      }
    ]);
  }
  static async saveQuestion({ question_id, user }) {
    const isSaved = await QuestionModel.findOne({
      _id: question_id,
      save: user
    });

    const operator = isSaved ? '$pull' : '$addToSet';

    return await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { [operator]: { save: user } },
      { new: true }
    ).lean();
  }
  static async voteAnswer({ question_id, answer_id, user, type }) {
    let question;
    if (type === 'up') {
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id, 'answers._id': answer_id },
        {
          $pull: { 'answers.$.vote_down': user },
          $push: { 'answers.$.vote_up': user }
        },
        { new: true }
      );
    } else if (type === 'down') {
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id, 'answers._id': answer_id },
        {
          $pull: { 'answers.$.vote_up': user },
          $push: { 'answers.$.vote_down': user }
        },
        { new: true }
      );
    } else if (type === 'cancel') {
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id, 'answers._id': answer_id },
        { $pull: { 'answers.$.vote_up': user, 'answers.$.vote_down': user } },
        { new: true }
      );
    }

    // vote_score
    const answer = question.answers.find(
      answer => answer._id.toString() === answer_id
    );
    const vote_score = answer.vote_up.length - answer.vote_down.length;
    await QuestionModel.findOneAndUpdate(
      { _id: question_id, 'answers._id': answer_id },
      { $set: { 'answers.$.vote_score': vote_score } }
    );
    return true;
  }
  static async voteCommentAnswer({ question_id, answer_id, comment_id, user }) {
    const question = await QuestionModel.findOne({
      _id: question_id,
      'answers._id': answer_id,
      'answers.comment._id': comment_id
    });
    const answer = question.answers.find(
      answer => answer._id.toString() === answer_id
    );
    const comment = answer.comment.find(
      comment => comment._id.toString() === comment_id
    );

    if (comment.vote.includes(user)) {
      await QuestionModel.findOneAndUpdate(
        { _id: question_id, 'answers._id': answer_id },
        { $pull: { 'answers.$[answer].comment.$[comment].vote': user } },
        {
          arrayFilters: [
            { 'answer._id': answer_id },
            { 'comment._id': comment_id }
          ]
        }
      ).lean();
    } else {
      await QuestionModel.findOneAndUpdate(
        { _id: question_id, 'answers._id': answer_id },
        {
          $push: { 'answers.$[answer].comment.$[comment].vote': user }
        },
        {
          arrayFilters: [
            { 'answer._id': answer_id },
            { 'comment._id': comment_id }
          ]
        }
      ).lean();
    }
    return true;
  }
  static async updateCommentAnswer({
    question_id,
    answer_id,
    comment_id,
    content
  }) {
    return await QuestionModel.findOneAndUpdate(
      {
        _id: question_id,
        'answers._id': answer_id,
        'answers.comment._id': comment_id
      },
      { $set: { 'answers.$[answer].comment.$[comment].content': content } },
      {
        arrayFilters: [
          { 'answer._id': answer_id },
          { 'comment._id': comment_id }
        ],
        new: true
      },
      { new: true }
    ).lean();
  }
  static async commentAnswer({ question_id, answer_id, user, content }) {
    return await QuestionModel.findOneAndUpdate(
      {
        _id: question_id,
        'answers._id': answer_id
      },
      {
        $push: { 'answers.$.comment': { user, content } }
      },
      { new: true }
    ).lean();
  }
  static async deleteAnswer({ question_id, answer_id }) {
    return await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { $pull: { answers: { _id: answer_id } } },
      { new: true }
    ).lean();
  }
  static async updateAnswer({ question_id, answer_id, content }) {
    return await QuestionModel.findOneAndUpdate(
      {
        _id: question_id,
        'answers._id': answer_id
      },
      {
        $set: {
          'answers.$.content': content,
          'answers.$.update_at': Date.now()
        }
      },
      { new: true }
    ).lean();
  }
  static async deleteCommentAnswer({ question_id, answer_id, comment_id }) {
    return await QuestionModel.findOneAndUpdate(
      {
        _id: question_id,
        'answers._id': answer_id,
        'answers.comment._id': comment_id
      },
      {
        $pull: {
          'answers.$.comment': { _id: comment_id }
        }
      },
      { new: true }
    ).lean();
  }
  static async answerQuestion({ question_id, user, content }) {
    return await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { $push: { answers: { user, content } } },
      { new: true }
    ).lean();
  }
  static async voteCommentQuestion({ question_id, comment_id, user }) {
    const question = await QuestionModel.findOne({
      _id: question_id,
      'comment._id': comment_id
    });
    const comment = question.comment.find(
      comment => comment._id.toString() === comment_id
    );
    if (comment.vote.includes(user)) {
      await QuestionModel.findOneAndUpdate(
        {
          _id: question_id,
          'comment._id': comment_id
        },
        {
          $pull: {
            'comment.$.vote': user
          }
        }
      ).lean();
    } else {
      await QuestionModel.findOneAndUpdate(
        {
          _id: question_id,
          'comment._id': comment_id
        },
        {
          $push: {
            'comment.$.vote': user
          }
        }
      ).lean();
    }
    return true;
  }
  static async deleteCommentQuestion({ question_id, comment_id }) {
    return await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { $pull: { comment: { _id: comment_id } } },
      { new: true }
    ).lean();
  }
  static async updateCommentQuestion({ question_id, comment_id, content }) {
    return await QuestionModel.findOneAndUpdate(
      {
        _id: question_id,
        'comment._id': comment_id
      },
      {
        $set: {
          'comment.$.content': content
        }
      },
      { new: true }
    ).lean();
  }
  static async commentQuestion({ question_id, user, content }) {
    return await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { $push: { comment: { user, content } } },
      { new: true }
    ).lean();
  }
  static async deleteQuestion(question_id) {
    return await QuestionModel.findByIdAndDelete(question_id);
  }
  static async updateQuestion({
    question_id,
    title,
    problem,
    expect,
    text,
    hashtags
  }) {
    return await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { title, problem, expect, text, hashtags, update_at: Date.now() },
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
      .populate('answers.user', pp_UserMore)
      .populate('comment.user', '_id name')
      .populate('answers.comment.user', '_id name')
      .lean();
  }
  static async createQuestion({
    user,
    title,
    problem,
    expect,
    text,
    hashtags
  }) {
    return await QuestionModel.create({
      user,
      title,
      problem,
      expect,
      text,
      hashtags
    });
  }
  static async checkExist(select) {
    return await QuestionModel.findOne(select).lean();
  }
  static async findConditionQuestions(select) {
    return await QuestionModel.find(select).lean();
  }
}

//Export the model
export { QuestionClass, QuestionModel };
