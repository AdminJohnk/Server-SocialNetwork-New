'use strict';

const { model, Schema, Types } = require('mongoose');
const { getSelectData, unGetSelectData } = require('../utils/functions');
const {
  pp_UserDefault,
  se_UserDefault,
  unSe_PostDefault
} = require('../utils/constants');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Post';
const COLLECTION_NAME = 'posts';

var PostSchema = new Schema(
  {
    type: { type: String, enum: ['Post', 'Share'], required: true },
    post_attributes: {
      // type = Post
      user: { type: ObjectId, ref: 'User' }, // me_id
      title: String,
      content: String,
      url: String,
      img: String,

      // type = Share
      user: { type: ObjectId, ref: 'User' }, // me_id
      post: { type: ObjectId, ref: 'Post' },
      owner_post: { type: ObjectId, ref: 'User' },

      // common field
      view_number: { type: Number, default: 0 },
      like_number: { type: Number, default: 0 },
      save_number: { type: Number, default: 0 },
      share_number: { type: Number, default: 0 },
      comment_number: { type: Number, default: 0 },

      likes: {
        type: [{ type: ObjectId, ref: 'User' }],
        select: false
      },
      shares: {
        type: [{ type: ObjectId, ref: 'User' }],
        select: false
      },
      saves: {
        type: [{ type: ObjectId, ref: 'User' }],
        select: false
      }
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const PostModel = model(DOCUMENT_NAME, PostSchema);

// Add fields is_liked, is_saved, is_shared
const addFieldsObject = user => {
  return {
    is_liked: { $in: [new ObjectId(user), '$post_attributes.likes'] },
    is_saved: { $in: [new ObjectId(user), '$post_attributes.saves'] },
    is_shared: { $in: [new ObjectId(user), '$post_attributes.shares'] }
  };
};
const choosePopulateAttr = ({ from, attribute, select }) => {
  return {
    $lookup: {
      from: from,
      let: { temp: '$post_attributes.' + attribute },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', '$$temp'] } } },
        { $project: select }
      ],
      as: 'post_attributes.' + attribute
    }
  };
};
const getFirstElement = attribute => {
  return {
    $addFields: {
      [`post_attributes.${attribute}`]: {
        $arrayElemAt: [`$post_attributes.${attribute}`, 0]
      }
    }
  };
};

class PostClass {
  static async viewPost({ post_id, user_id, cookies, res }) {
    // Check if the post has already been viewed
    let viewedPosts = cookies?.viewedPosts || [];
    if (viewedPosts.includes(post_id)) {
      return await PostModel.findByID({ post_id });
    }
    // Increase view count
    await this.changeNumberPost({
      post_id,
      type: 'view',
      number: 1
    });

    // Add post to viewedPosts
    viewedPosts.push(post_id);
    res.cookie('viewedPosts', viewedPosts, {
      maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });

    return await PostModel.findByID({ post_id });
  }
  static async getAllPopularPost({ user_id, limit, skip, sort }) {
    let condidion = {};
    let foundPost = await this.findPostByAggregate({
      condidion,
      me_id: user_id,
      limit,
      skip,
      sort
    });
    return foundPost;
  }
  static async getAllPostForNewsFeed({ user_id, limit, skip, sort }) {
    let condidion = {};
    let foundPost = await this.findPostByAggregate({
      condidion,
      me_id: user_id,
      limit,
      skip,
      sort
    });
    return foundPost;
  }
  static async getAllUserLikePost({ post, owner_post, limit, skip, sort }) {
    return await this.getAllUserByPost({
      type: 'like',
      post,
      owner_post,
      limit,
      skip,
      sort
    });
  }
  static async getAllUserSharePost({ post, owner_post, limit, skip, sort }) {
    return await this.getAllUserByPost({
      type: 'share',
      post,
      owner_post,
      limit,
      skip,
      sort
    });
  }
  static async getAllUserSavePost({ post, owner_post, limit, skip, sort }) {
    return await this.getAllUserByPost({
      type: 'save',
      post,
      owner_post,
      limit,
      skip,
      sort
    });
  }
  // type = ['like', 'share', ', 'save']
  static async getAllUserByPost({ type, post, owner_post, limit, skip, sort }) {
    const result = await PostModel.findOne({
      _id: post,
      'post_attributes.user': owner_post
    })
      .populate(`post_attributes.${type}s`, pp_UserDefault)
      .select(`post_attributes.${type}s`)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    return result.post_attributes[`${type}s`];
  }
  static async deletePost({ post_id }) {
    return await PostModel.findByIdAndDelete(post_id).lean();
  }
  static async updatePost({ post_id, post_attributes }) {
    return await PostModel.findByIdAndUpdate(post_id, post_attributes, {
      new: true
    }).lean();
  }
  static async sharePost({ type = 'Share', post_attributes }) {
    // Kiểm tra xem đã share bài viết này chưa
    const sharedPost = await this.checkExist({
      'post_attributes.user': post_attributes.user,
      'post_attributes.post': post_attributes.post,
      type
    });

    let numShare = 1;

    if (sharedPost) {
      await PostModel.deleteOne(sharedPost._id);
      numShare = -1;
    } else await PostModel.create({ type, post_attributes });

    this.changeNumberPost({
      post_id: post_attributes.post,
      type: 'share',
      number: numShare
    }).catch(err => console.log(err));

    return {
      numShare
    };
  }
  static async getAllPost({ limit, skip, sort }) {
    let posts = PostModel.find().skip(skip).limit(limit).sort(sort);
    return await this.populatePostShare(posts);
  }
  static async getAllPostByUserId({ user_id, me_id, limit, skip, sort }) {
    let condidion = { 'post_attributes.user': new ObjectId(user_id) };
    let foundPost = await this.findPostByAggregate({
      condidion,
      me_id,
      limit,
      skip,
      sort
    });
    return foundPost;
  }
  static async findByID({ post_id, user }) {
    let condidion = { _id: new ObjectId(post_id) };
    let foundPost = await this.findPostByAggregate({ condidion, me_id: user });
    return foundPost[0];
  }
  static async findPostByAggregate({
    condidion,
    me_id,
    limit = 1,
    skip = 0,
    sort = { ctime: -1 }
  }) {
    let foundPost = await PostModel.aggregate([
      { $match: condidion },
      { $addFields: { ...addFieldsObject(me_id) } },
      // ================== user ==================
      choosePopulateAttr({
        from: 'users',
        attribute: 'user',
        select: getSelectData(se_UserDefault)
      }),
      getFirstElement('user'),
      // ================== owner_post ==================
      choosePopulateAttr({
        from: 'users',
        attribute: 'owner_post',
        select: getSelectData(se_UserDefault)
      }),
      getFirstElement('owner_post'),
      // ================== post ==================
      choosePopulateAttr({
        from: 'posts',
        attribute: 'post',
        select: unGetSelectData(unSe_PostDefault)
      }),
      getFirstElement('post'),
      { $project: { ...unGetSelectData(unSe_PostDefault) } },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ]);

    foundPost.map(post => {
      if (post.type === 'Post') {
        delete foundPost[0].post_attributes.post;
        delete foundPost[0].post_attributes.owner_post;
      }
    });

    return foundPost;
  }
  static async populatePostShare(postShare) {
    return await postShare.populate({
      path: 'post_attributes',
      populate: [
        { path: 'user', select: pp_UserDefault },
        { path: 'owner_post', select: pp_UserDefault },
        { path: 'post' }
      ]
    });
  }
  static async populatePost(post) {
    return await post.populate({
      path: 'post_attributes',
      populate: { path: 'user', select: pp_UserDefault }
    });
  }
  // type = ['view', 'like', 'share', 'comment', 'save']
  static async changeNumberPost({ post_id, type, number }) {
    let stringUpdate = 'post_attributes.' + type + '_number';
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
  // type ['like', 'save', 'share']
  // number = 1 or -1
  static async changeBehaviorPost({ post_id, type, user_id, number }) {
    let stringUpdate = 'post_attributes.' + type + 's';
    let operator = number === 1 ? '$addToSet' : '$pull';
    return await PostModel.findByIdAndUpdate(
      post_id,
      {
        [operator]: {
          [stringUpdate]: user_id
        }
      },
      { new: true }
    );
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
