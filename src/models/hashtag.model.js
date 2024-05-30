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
  static async getAllHashTags({ sort }) {
    const hashtags = await HashTagsModel.find().sort(sort);

    return hashtags.sort((a, b) => b.posts.length - a.posts.length);
  }
  static async getNormalPostByHashtag({ name }) {
    const foundHashTag = await HashTagsModel.findOne({ name });
    if (!foundHashTag) return false;
    return foundHashTag.posts;
  }
  static async getCommunityPostByHashtag({ name }) {
    const foundHashTag = await HashTagsModel.findOne({ name });
    if (!foundHashTag) return false;
    return foundHashTag.communities;
  }
  static async getQuestionByHashtag({ name }) {
    const foundHashTag = await HashTagsModel.findOne({ name });
    if (!foundHashTag) return false;
    return foundHashTag.questions;
  }
  static async createOrUpdateHashTag({ name, post_id, is_removed = false, scope }) {
    const foundHashTag = await HashTagsModel.findOne({ name });
    console.log(scope, 'scopehashtag')
    if (foundHashTag) {
      if (scope === 'Community') {
        if (is_removed) {
          // remove post_id from communities
          foundHashTag.communities = foundHashTag.communities.filter((post) => post.toString() != post_id.toString());
          return await foundHashTag.save();
        }
        if (foundHashTag.communities.some((post) => post.toString() == post_id.toString())) return foundHashTag;
        foundHashTag.communities.push(new ObjectId(post_id));
      } else if (scope === 'Question') {
        if (is_removed) {
          // remove post_id from questions
          foundHashTag.questions = foundHashTag.questions.filter((post) => post.toString() != post_id.toString());
          return await foundHashTag.save();
        }
        if (foundHashTag.questions.some((post) => post.toString() == post_id.toString())) return foundHashTag;
        foundHashTag.questions.push(new ObjectId(post_id));
      } else {
        if (is_removed) {
          // remove post_id from posts
          foundHashTag.posts = foundHashTag.posts.filter((post) => post.toString() != post_id.toString());
          return await foundHashTag.save();
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
      newHashTag.questions.push(new ObjectId(post_id));
    } else {
      newHashTag.posts.push(new ObjectId(post_id));
    }
    return await newHashTag.save();
  }
  static async deletePostHashTags({ name, post_id, scope = 'Normal' }) {
    const foundHashTag = await HashTagsModel.findOne({ name });
    if (!foundHashTag) return false;

    if (scope === 'Community') {
      foundHashTag.communities = foundHashTag.communities.filter((post) => post.toString() != post_id.toString());
    } else if (scope === 'Question') {
      foundHashTag.questions = foundHashTag.questions.filter((post) => post.toString() != post_id.toString());
    } else {
      foundHashTag.posts = foundHashTag.posts.filter((post) => post.toString() != post_id.toString());
    }

    return await foundHashTag.save();
  }
}

//Export the model
export { HashTagsClass, HashTagsModel };
