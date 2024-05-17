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
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const HashTagsModel = model(DOCUMENT_NAME, HashTagsSchema);

class HashTagsClass {
  static async getHashTagByName({ name }) {
    const foundHashTag = await HashTagsModel.findOne({ name });
    if (!foundHashTag) return false;
    return foundHashTag.posts;
  }
  static async createOrUpdateHashTag({ name, post_id, is_removed = false }) {
    const foundHashTag = await HashTagsModel.findOne({ name });
    if (foundHashTag) {
      if (is_removed) {
        // remove post_id from posts
        foundHashTag.posts = foundHashTag.posts.filter((post) => post.toString() != post_id.toString());
        return await foundHashTag.save();
      }
      if (foundHashTag.posts.some((post) => post.toString() == post_id.toString())) return foundHashTag;
      foundHashTag.posts.push(new ObjectId(post_id));
      return await foundHashTag.save();
    }
    return await HashTagsModel.create({ name, posts: [post_id] });
  }
  static async deletePostHashTags({ name, post_id }) {
    const foundHashTag = await HashTagsModel.findOne({ name });
    if (!foundHashTag) return false;
    foundHashTag.posts = foundHashTag.posts.filter((post) => post.toString() != post_id.toString());
    return await foundHashTag.save();
  }
}

//Export the model
export { HashTagsClass, HashTagsModel };
