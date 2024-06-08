'use strict';

import { model, Schema, Types } from 'mongoose';
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

const HashTagsModel = model(DOCUMENT_NAME, HashTagsSchema);

class HashTagsClass {
  static async getAllHashTagsQuestion({ skip, limit }) {
    // get name, question_number if question_number > 0
    return await HashTagsModel.aggregate([
      {
        $project: {
          name: 1,
          questions: 1,
          question_number: { $size: '$questions' }
        }
      },
      { $match: { question_number: { $gt: 0 } } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions',
          foreignField: '_id',
          as: 'questions'
        }
      },
      {
        $project: {
          name: 1,
          questions: {
            $map: {
              input: '$questions',
              as: 'question',
              in: {
                _id: '$$question._id',
                createdAt: '$$question.createdAt'
              }
            }
          }
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
  static async createOrUpdateHashTag({
    name,
    post_id,
    question_id,
    is_removed = false,
    scope
  }) {
    const foundHashTag = await HashTagsModel.findOne({ name });

    const removeHashTag = async foundHashTag => {
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
            post => post.toString() != post_id.toString()
          );
          await foundHashTag.save();
          await removeHashTag(foundHashTag);
          return true;
        }
        if (
          foundHashTag.communities.some(
            post => post.toString() == post_id.toString()
          )
        )
          return foundHashTag;
        foundHashTag.communities.push(new ObjectId(post_id));
      } else if (scope === 'Question') {
        if (is_removed) {
          // remove post_id from questions
          foundHashTag.questions = foundHashTag.questions.filter(
            question => question.toString() != question_id.toString()
          );
          await foundHashTag.save();
          await removeHashTag(foundHashTag);
          return true;
        }
        if (
          foundHashTag.questions.some(
            question => question.toString() == question_id.toString()
          )
        ) {
          return foundHashTag;
        }
        foundHashTag.questions.push(new ObjectId(question_id));
      } else {
        if (is_removed) {
          // remove post_id from posts
          foundHashTag.posts = foundHashTag.posts.filter(
            post => post.toString() != post_id.toString()
          );
          await foundHashTag.save();
          await removeHashTag(foundHashTag);
          return true;
        }
        if (
          foundHashTag.posts.some(post => post.toString() == post_id.toString())
        )
          return foundHashTag;
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
      const type =
        scope === 'Community'
          ? 'communities'
          : scope === 'Question'
            ? 'questions'
            : 'posts';

      foundHashTag[type] = foundHashTag[type].filter(
        id => id.toString() != (type !== 'questions' ? post_id.toString() : question_id.toString())
      );
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
