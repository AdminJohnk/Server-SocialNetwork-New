'use strict';

import { model, Schema, Types } from 'mongoose';
import { pp_UserDefault, pp_UserMore, VoteType } from '../utils/constants.js';
import { text } from 'stream/consumers';
import { UserClass } from './user.model.js';
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
  static getVoteScore({ old_vote_score, type, old, level }) {
    if (type === 'up') {
      if (old === 'down') {
        return old_vote_score + level * 2;
      } else if (old === 'cancel') {
        return old_vote_score + level;
      }
    } else if (type === 'down') {
      if (old === 'up') {
        return old_vote_score - level * 2;
      } else if (old === 'cancel') {
        return old_vote_score - level;
      }
    } else if (type === 'cancel') {
      if (old === 'up') {
        return old_vote_score - level;
      } else if (old === 'down') {
        return old_vote_score + level;
      }
    }
  }
  static async getNumberQuestions() {
    return await QuestionModel.countDocuments();
  }
  static async getAllQuestions({ skip, limit, sort }) {
    return await QuestionModel.aggregate([
      {
        $sort:
          sort === 'score'
            ? { vote_score: -1 }
            : sort === 'latest'
            ? { createdAt: -1 }
            : sort === 'oldest'
            ? { createdAt: 1 }
            : sort === 'frequent'
            ? { view: -1 }
            : { createdAt: -1 }
      },
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
      },
      {
        $match: sort === 'unanswered' ? { answer_number: 0 } : {}
      }
    ]);
  }
  static async saveQuestion({ question_id, user }) {
    const isSaved = await QuestionModel.findOne({
      _id: question_id,
      save: user
    });

    const operator = isSaved ? '$pull' : '$addToSet';

    await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { [operator]: { save: user } },
      { new: true }
    ).lean();

    return true;
  }
  static async voteAnswer({ question_id, answer_id, user, type, old }) {
    let vote_score_;
    let question;
    if (type === 'up') {
      if (old === 'down') {
        vote_score_ = VoteType.Answer * 2;
      } else if (old === 'cancel') {
        vote_score_ = VoteType.Answer;
      }
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id, 'answers._id': answer_id },
        {
          $pull: { 'answers.$.vote_down': user },
          $push: { 'answers.$.vote_up': user }
        },
        { new: true }
      );
    } else if (type === 'down') {
      if (old === 'up') {
        vote_score_ = -(VoteType.Answer * 2);
      } else if (old === 'cancel') {
        vote_score_ = -VoteType.Answer;
      }
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id, 'answers._id': answer_id },
        {
          $pull: { 'answers.$.vote_up': user },
          $push: { 'answers.$.vote_down': user }
        },
        { new: true }
      );
    } else if (type === 'cancel') {
      if (old === 'up') {
        vote_score_ = -VoteType.Answer;
      } else if (old === 'down') {
        vote_score_ = VoteType.Answer;
      }
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id, 'answers._id': answer_id },
        { $pull: { 'answers.$.vote_up': user, 'answers.$.vote_down': user } },
        { new: true }
      );
    }

    // vote_score
    const answer = question.answers.find((answer) => answer._id.toString() === answer_id);
    const { level } = await UserClass.getReputation({ user_id: user });
    const old_vote_score = answer.vote_score;

    const vote_score = QuestionClass.getVoteScore({ old_vote_score, type, old, level });

    await QuestionModel.findOneAndUpdate(
      { _id: question_id, 'answers._id': answer_id },
      { $set: { 'answers.$.vote_score': vote_score } }
    );
    return vote_score_;
  }
  static async voteCommentAnswer({ question_id, answer_id, comment_id, user }) {
    let vote_score = -VoteType.Comment;
    const question = await QuestionModel.findOne({
      _id: question_id,
      'answers._id': answer_id,
      'answers.comment._id': comment_id
    });
    const answer = question.answers.find((answer) => answer._id.toString() === answer_id);
    const comment = answer.comment.find((comment) => comment._id.toString() === comment_id);

    if (comment.vote.includes(user)) {
      await QuestionModel.findOneAndUpdate(
        { _id: question_id, 'answers._id': answer_id },
        { $pull: { 'answers.$[answer].comment.$[comment].vote': user } },
        {
          arrayFilters: [{ 'answer._id': answer_id }, { 'comment._id': comment_id }]
        }
      ).lean();
    } else {
      vote_score = VoteType.Comment;
      await QuestionModel.findOneAndUpdate(
        { _id: question_id, 'answers._id': answer_id },
        {
          $push: { 'answers.$[answer].comment.$[comment].vote': user }
        },
        {
          arrayFilters: [{ 'answer._id': answer_id }, { 'comment._id': comment_id }]
        }
      ).lean();
    }
    return vote_score;
  }
  static async updateCommentAnswer({ question_id, answer_id, comment_id, content }) {
    await QuestionModel.findOneAndUpdate(
      {
        _id: question_id,
        'answers._id': answer_id,
        'answers.comment._id': comment_id
      },
      { $set: { 'answers.$[answer].comment.$[comment].content': content } },
      {
        arrayFilters: [{ 'answer._id': answer_id }, { 'comment._id': comment_id }],
        new: true
      },
      { new: true }
    ).lean();

    return true;
  }
  static async commentAnswer({ question_id, answer_id, user, content }) {
    await QuestionModel.findOneAndUpdate(
      {
        _id: question_id,
        'answers._id': answer_id
      },
      {
        $push: { 'answers.$.comment': { user, content } }
      },
      { new: true }
    ).lean();

    return true;
  }
  static async deleteAnswer({ question_id, answer_id }) {
    await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { $pull: { answers: { _id: answer_id } } },
      { new: true }
    ).lean();

    return true;
  }
  static async updateAnswer({ question_id, answer_id, content }) {
    await QuestionModel.findOneAndUpdate(
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

    return true;
  }
  static async deleteCommentAnswer({ question_id, answer_id, comment_id }) {
    await QuestionModel.findOneAndUpdate(
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

    return true;
  }
  static async answerQuestion({ question_id, user, content }) {
    await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { $push: { answers: { user, content } } },
      { new: true }
    ).lean();

    return true;
  }
  static async voteCommentQuestion({ question_id, comment_id, user }) {
    let vote_score = -VoteType.Comment;
    const question = await QuestionModel.findOne({
      _id: question_id,
      'comment._id': comment_id
    });
    const comment = question.comment.find((comment) => comment._id.toString() === comment_id);
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
      vote_score = VoteType.Comment;
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
    return vote_score;
  }
  static async deleteCommentQuestion({ question_id, comment_id }) {
    await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { $pull: { comment: { _id: comment_id } } },
      { new: true }
    ).lean();

    return true;
  }
  static async updateCommentQuestion({ question_id, comment_id, content }) {
    await QuestionModel.findOneAndUpdate(
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

    return true;
  }
  static async commentQuestion({ question_id, user, content }) {
    await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { $push: { comment: { user, content } } },
      { new: true }
    ).lean();

    return true;
  }
  static async deleteQuestion(question_id) {
    await QuestionModel.findByIdAndDelete(question_id);
    return true;
  }
  static async updateQuestion({ question_id, title, problem, expect, text, hashtags }) {
    await QuestionModel.findOneAndUpdate(
      { _id: question_id },
      { title, problem, expect, text, hashtags, update_at: Date.now() },
      { new: true }
    ).lean();
    return true;
  }
  static async voteQuestion({ question_id, type, user, old }) {
    let vote_score_;
    let question;
    if (type === 'up') {
      if (old === 'down') {
        vote_score_ = VoteType.Question * 2;
      } else if (old === 'cancel') {
        vote_score_ = VoteType.Question;
      }
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id },
        { $pull: { vote_down: user }, $push: { vote_up: user } },
        { new: true }
      );
    } else if (type === 'down') {
      if (old === 'up') {
        vote_score_ = -(VoteType.Question * 2);
      } else if (old === 'cancel') {
        vote_score_ = -VoteType.Question;
      }
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id },
        { $pull: { vote_up: user }, $push: { vote_down: user } },
        { new: true }
      );
    } else if (type === 'cancel') {
      if (old === 'up') {
        vote_score_ = -VoteType.Question;
      } else if (old === 'down') {
        vote_score_ = VoteType.Question;
      }
      question = await QuestionModel.findOneAndUpdate(
        { _id: question_id },
        { $pull: { vote_up: user, vote_down: user } },
        { new: true }
      );
    }

    // vote_score
    const { level } = await UserClass.getReputation({ user_id: user });
    const old_vote_score = question.vote_score;

    const vote_score = QuestionClass.getVoteScore({ old_vote_score, type, old, level });

    await QuestionModel.findOneAndUpdate({ _id: question_id }, { $set: { vote_score } });
    return vote_score_;
  }
  static async viewQuestion({ question_id }) {
    await QuestionModel.findOneAndUpdate({ _id: question_id }, { $inc: { view: 1 } }, { new: true }).lean();
    return true;
  }
  static async getQuestionById(question_id) {
    return await QuestionModel.findById(question_id)
      .populate('user', pp_UserMore)
      .populate('answers.user', pp_UserMore)
      .populate('comment.user', '_id name')
      .populate('answers.comment.user', '_id name')
      .lean();
  }
  static async createQuestion({ user, title, problem, expect, text, hashtags }) {
    await QuestionModel.create({
      user,
      title,
      problem,
      expect,
      text,
      hashtags
    });

    return true;
  }
  static async checkExist(select) {
    return await QuestionModel.findOne(select).lean();
  }
}

//Export the model
export { QuestionClass, QuestionModel };
