'use strict';

const { model, Schema, Types } = require('mongoose');
const { unGetSelectData } = require('../utils');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Post';
const COLLECTION_NAME = 'posts';

var PostSchema = new Schema(
  {
    type: { type: String, enum: ['Post', 'Share'], required: true },
    post_attributes: {
      // type = Post
      user: { type: ObjectId, ref: 'User' }, // meId
      title: String,
      content: String,
      url: String,
      img: String,

      // type = Share
      user: { type: ObjectId, ref: 'User' }, // meId
      post: { type: ObjectId, ref: 'Post' },
      owner_post: { type: ObjectId, ref: 'User' },

      // common field
      view_number: { type: Number, default: 0 },
      like_number: { type: Number, default: 0 },
      share_number: { type: Number, default: 0 },
      comment_number: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

// UserModel:{
//   favorites: {
//     type: [{ type: ObjectId, ref: 'Post' }],
//     default: []
//   },
// }

const PostModel = model(DOCUMENT_NAME, PostSchema);

class PostClass {
  static async deletePost({ post_id }) {
    return await PostModel.findByIdAndDelete(post_id).lean();
  }
  static async updatePost({ post_id, post_attributes }) {
    return await PostModel.findByIdAndUpdate(post_id, post_attributes, {
      new: true
    }).lean();
  }
  static async getAllPost({ limit, skip, sort }) {
    let posts = PostModel.find().skip(skip).limit(limit).sort(sort);
    return await this.populatePostShare(posts);
  }
  static async getAllPostByUserId({ user_id, limit, skip, sort }) {
    let posts = PostModel.find({ 'post_attributes.user': user_id })
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return await this.populatePostShare(posts);
  }
  static async sharePost({ type, post_attributes }) {
    // Kiểm tra xem đã share bài viết này chưa
    const sharedPost = await this.checkExist({
      'post_attributes.user': post_attributes.user,
      'post_attributes.post': post_attributes.post,
      type
    });

    let numShare = 1;

    if (sharedPost) {
      await PostModel.deleteOne(sharedPost);
      numShare = -1;
    } else await PostModel.create({ type, post_attributes });

    return await this.changeNumberPost({
      post_id: post_attibutes.post,
      type: 'share',
      number: numShare
    });
  }
  static async createPost({ type, post_attributes }) {
    return await PostModel.create({ type, post_attributes });
  }
  static async findByID({ post_id }) {
    let foundPost = await PostModel.findOne({ _id: post_id });
    if (foundPost) {
      if (foundPost.type === 'Share') {
        foundPost = await this.populatePostShare(foundPost);
      }
    }

    return foundPost;
  }
  static async populatePostShare(postShare) {
    return await postShare.populate({
      path: 'post_attributes',
      populate: [
        { path: 'user', select: '_id name email user_image' },
        { path: 'owner_post', select: '_id name email user_image' },
        { path: 'post' }
      ]
    });
  }
  // type = ['view', 'like', 'share', 'comment']
  static async changeNumberPost({ post_id, type, number }) {
    let stringUpdate = 'post_attibutes.' + type + '_number';
    return await PostModel.findByIdAndUpdate(
      post_id,
      {
        $inc: {
          [stringUpdate]: number
        }
      },
      { new: true }
    ).lean();
  }
  static async checkExist(select) {
    return await PostModel.findOne(select).lean();
  }
}

//Export the model
module.exports = {
  PostClass,
  PostModel
};
