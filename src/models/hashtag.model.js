'use strict';

import { model, Schema, Types } from 'mongoose';
import path from 'path';
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'HashTags';
const COLLECTION_NAME = 'hashtags';

const HashTagsSchema = new Schema(
  {
    name: { type: String, required: true },
    posts: {
      type: [{ type: ObjectId, ref: 'Post' }],
      default: []
    },
    communities: {
      type: [{ type: ObjectId, ref: 'Post' }],
      default: []
    },
    questions: {
      type: [{ type: ObjectId, ref: 'Question' }],
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

HashTagsSchema.index({ name: 'text' });

const HashTagsModel = model(DOCUMENT_NAME, HashTagsSchema);

class HashTagsClass {
  static async getNumberQuestionByTag({ name, sort }) {
    const result = await HashTagsModel.aggregate([
      { $match: { name } },
      { $unwind: '$questions' },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions',
          foreignField: '_id',
          as: 'questions'
        }
      },
      {
        $project: { _id: 0, questions: 1 }
      },
      {
        $match: sort === 'unanswered' ? { 'questions.answers': { $size: 0 } } : {}
      },
      {
        $count: 'number'
      }
    ]);

    return result[0]?.number;
  }
  static async getAllQuestionByTag({ name, limit, skip, sort }) {
    const result = await HashTagsModel.aggregate([
      { $match: { name } },
      { $unwind: '$questions' },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions',
          foreignField: '_id',
          as: 'questions'
        }
      },
      {
        $addFields: {
          question: { $arrayElemAt: ['$questions', 0] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'question.user',
          foreignField: '_id',
          as: 'question.user'
        }
      },
      { $unwind: '$question.user' },
      {
        $sort:
          sort === 'score'
            ? { 'question.vote_score': -1 }
            : sort === 'latest'
            ? { 'question.createdAt': -1 }
            : sort === 'oldest'
            ? { 'question.createdAt': 1 }
            : sort === 'frequent'
            ? { 'question.view': -1 }
            : { 'question.createdAt': -1 }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          question: {
            _id: 1,
            title: 1,
            problem: 1,
            hashtags: 1,
            text: 1,
            user: { _id: 1, name: 1, user_image: 1 },
            vote_score: 1,
            view: 1,
            answer_number: { $size: '$question.answers' },
            createdAt: 1
          }
        }
      },
      {
        $match: sort === 'unanswered' ? { 'question.answers': { $size: 0 } } : {}
      }
    ]);

    return result.map((item) => item.question);
  }
  static async findTagsQuestion({ tag, skip, limit, sort }) {
    return await HashTagsModel.aggregate([
      { $match: { questions: { $ne: [] }, $text: { $search: tag } } },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions',
          foreignField: '_id',
          as: 'questions'
        }
      },
      {
        $addFields: {
          question_number: { $size: '$questions' }
        }
      },
      {
        $sort:
          sort === 'popular' ? { question_number: -1 } : sort === 'name' ? { name: 1 } : { createdAt: -1 }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $addFields: {
          counts: {
            $reduce: {
              input: '$questions.createdAt',
              initialValue: { today: 0, thisWeek: 0 },
              in: {
                $cond: [
                  {
                    $gte: ['$$this', new Date(new Date() - 24 * 60 * 60 * 1000)]
                  },
                  {
                    today: { $add: ['$$value.today', 1] },
                    thisWeek: { $add: ['$$value.thisWeek', 1] }
                  },
                  {
                    $cond: [
                      {
                        $gte: ['$$this', new Date(new Date() - 7 * 24 * 60 * 60 * 1000)]
                      },
                      {
                        today: '$$value.today',
                        thisWeek: { $add: ['$$value.thisWeek', 1] }
                      },
                      '$$value'
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          question_number: 1, // Tính question_number sau khi lookup
          number_today: '$counts.today',
          number_this_week: '$counts.thisWeek'
        }
      }
    ]);
  }
  static async getNumberTagsQuestion({ tag }) {
    const condition = { questions: { $ne: [] } };
    if (tag) condition.$text = { $search: tag };
    return await HashTagsModel.countDocuments(condition);
  }
  static async getAllHashTagsQuestion({ skip, limit, sort }) {
    return await HashTagsModel.aggregate([
      { $match: { questions: { $ne: [] } } },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions',
          foreignField: '_id',
          as: 'questions'
        }
      },
      {
        $addFields: {
          question_number: { $size: '$questions' }
        }
      },
      {
        $sort:
          sort === 'popular' ? { question_number: -1 } : sort === 'name' ? { name: 1 } : { createdAt: -1 }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $addFields: {
          counts: {
            $reduce: {
              input: '$questions.createdAt',
              initialValue: { today: 0, thisWeek: 0 },
              in: {
                $cond: [
                  {
                    $gte: ['$$this', new Date(new Date() - 24 * 60 * 60 * 1000)]
                  },
                  {
                    today: { $add: ['$$value.today', 1] },
                    thisWeek: { $add: ['$$value.thisWeek', 1] }
                  },
                  {
                    $cond: [
                      {
                        $gte: ['$$this', new Date(new Date() - 7 * 24 * 60 * 60 * 1000)]
                      },
                      {
                        today: '$$value.today',
                        thisWeek: { $add: ['$$value.thisWeek', 1] }
                      },
                      '$$value'
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          question_number: 1, // Tính question_number sau khi lookup
          number_today: '$counts.today',
          number_this_week: '$counts.thisWeek'
        }
      }
    ]);
  }
  static async getAllHashTags({ sort }) {
    const hashtags = await HashTagsModel.find().sort(sort);
    return hashtags.sort((a, b) => b.posts.length - a.posts.length);
  }
  static async getNormalPostByHashtag({ name }) {
    return await HashTagsModel.findOne({ name }).select('posts').lean();
  }
  static async getCommunityPostByHashtag({ name }) {
    return await HashTagsModel.findOne({ name }).select('communities').lean();
  }
  static async getQuestionByHashtag({ name }) {
    return await HashTagsModel.findOne({ name }).select('questions').lean();
  }
  static async createOrUpdateHashTag({ name, post_id, question_id, is_removed = false, scope }) {
    const foundHashTag = await HashTagsModel.findOne({ name });

    const removeHashTag = async (foundHashTag) => {
      if (
        foundHashTag.posts.length === 0 &&
        foundHashTag.communities.length === 0 &&
        foundHashTag.questions.length === 0
      ) {
        console.log('foundHashTag::: ', foundHashTag);
        await HashTagsModel.findOneAndDelete({ name: foundHashTag.name });
      }
    };

    if (foundHashTag) {
      if (scope === 'Community') {
        if (is_removed) {
          // remove post_id from communities
          foundHashTag.communities = foundHashTag.communities.filter(
            (post) => post.toString() != post_id.toString()
          );
          await foundHashTag.save();
          await removeHashTag(foundHashTag);
          return true;
        }
        if (foundHashTag.communities.some((post) => post.toString() == post_id.toString()))
          return foundHashTag;
        foundHashTag.communities.push(new ObjectId(post_id));
      } else if (scope === 'Question') {
        if (is_removed) {
          // remove post_id from questions
          foundHashTag.questions = foundHashTag.questions.filter(
            (question) => question.toString() != question_id.toString()
          );
          await foundHashTag.save();
          await removeHashTag(foundHashTag);
          return true;
        }
        if (foundHashTag.questions.some((question) => question.toString() == question_id.toString())) {
          return foundHashTag;
        }
        foundHashTag.questions.push(new ObjectId(question_id));
      } else {
        if (is_removed) {
          // remove post_id from posts
          foundHashTag.posts = foundHashTag.posts.filter((post) => post.toString() != post_id.toString());
          await foundHashTag.save();
          await removeHashTag(foundHashTag);
          return true;
        }
        if (foundHashTag.posts.some((post) => post.toString() == post_id.toString())) return foundHashTag;
        foundHashTag.posts.push(new ObjectId(post_id));
      }

      return await foundHashTag.save();
    }

    const newHashTag = new HashTagsModel({ name });
    if (scope === 'Community') {
      newHashTag.communities.push(new ObjectId(post_id));
    } else if (scope === 'Question') {
      newHashTag.questions.push(new ObjectId(question_id));
    } else {
      newHashTag.posts.push(new ObjectId(post_id));
    }
    return await newHashTag.save();
  }

  static async deletePostHashTags({ post_id, question_id, hashTags, scope }) {
    for (let name of hashTags) {
      const foundHashTag = await HashTagsModel.findOne({
        name
      });
      if (!foundHashTag) continue;
      const type = scope === 'Community' ? 'communities' : scope === 'Question' ? 'questions' : 'posts';

      foundHashTag[type] = foundHashTag[type].filter((id) => id.toString() != (type !== 'questions' ? post_id.toString() : question_id.toString()));
      await foundHashTag.save();

      if (
        foundHashTag.posts.length === 0 &&
        foundHashTag.communities.length === 0 &&
        foundHashTag.questions.length === 0
      ) {
        HashTagsModel.deleteOne({ name });
      }
    }
  }
}

//Export the model
export { HashTagsClass, HashTagsModel };
