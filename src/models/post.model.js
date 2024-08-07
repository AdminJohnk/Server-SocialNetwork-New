'use strict';

import { model, Schema, Types } from 'mongoose';
import { getSelectData, unGetSelectData } from '../utils/functions.js';
import {
  pp_UserDefault,
  se_UserDefault,
  unSe_PostDefault,
  se_UserDefaultForPost
} from '../utils/constants.js';
import { FriendClass } from './friend.model.js';
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Post';
const COLLECTION_NAME = 'posts';

const PostSchema = new Schema(
  {
    type: { type: String, enum: ['Post', 'Share'], required: true },
    scope: {
      type: String,
      enum: ['Normal', 'Community'],
      default: 'Normal'
    },
    community: { type: ObjectId, ref: 'Community' },
    visibility: {
      type: String,
      enum: ['public', 'private', 'member', 'friend'],
      default: 'public'
    },

    post_attributes: {
      user: { type: ObjectId, ref: 'User' }, // me_id
      content: String,

      // type = Post
      link: String,
      images: { type: [String], default: [] },

      // type = Share
      post: { type: ObjectId, ref: 'Post' },
      owner_post: { type: ObjectId, ref: 'User' },

      // common field
      like_number: { type: Number, default: 0 },
      save_number: { type: Number, default: 0 },
      share_number: { type: Number, default: 0 },
      comment_number: { type: Number, default: 0 },
      view_number: { type: Number, default: 0 },

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
      },
      comments: {
        type: [{ type: ObjectId, ref: 'User' }],
        select: false
      },
      hashtags: { type: [String], default: [] },
      tags: { type: [String], default: [] },
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

PostSchema.index({ _id: 1, 'post_attributes.user': 1 }, { unique: true });
PostSchema.index({ 'post_attributes.user': 1, createdAt: 1 });
PostSchema.index({ 'post_attributes.view_number': 1, createdAt: -1 });

const PostModel = model(DOCUMENT_NAME, PostSchema);

// Add fields is_liked, is_saved, is_shared
const addFieldsObject = user => {
  return {
    is_liked: { $in: [new ObjectId(user), '$post_attributes.likes'] },
    is_saved: { $in: [new ObjectId(user), '$post_attributes.saves'] },
    is_shared: { $in: [new ObjectId(user), '$post_attributes.shares'] }
  };
};

// attribute = ['user', 'owner_post', 'post']
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
  static async getAllImage({ user_id }) {
    const images = await PostModel.find({
      'post_attributes.user': user_id,
      type: 'Post'
    })
      // get Id of post to post_id
      .select('_id')
      .select('post_attributes.images')
      .sort({ createdAt: -1 })
      .lean();

    const imagesArray = images
      .map(image =>
        image.post_attributes.images.map(img => ({ post_id: image._id, image: img }))
      )
      .flat();

    return imagesArray;
  }
  static async getSavedPosts({ user_id, limit, skip, sort }) {
    let condition = { 'post_attributes.saves': new ObjectId(user_id) };
    let foundPost = await this.findPostByAggregate({
      condition,
      me_id: user_id,
      limit,
      skip,
      isFullSearch: true,
      sort
    });
    return foundPost;
  }
  static async viewPost({ post_id, user_id, cookies, res }) {
    // Check if the post has already been viewed
    let viewedPosts = cookies?.viewedPosts || '';
    if (viewedPosts.includes(post_id)) {
      return await this.findByID({ post_id });
    }
    // Increase view count
    await this.changeToArrayPost({
      post_id,
      type: 'view',
      number: 1,
      user_id
    });

    // Add post to viewedPosts
    viewedPosts += `${post_id},`;

    return { viewedPosts };
  }
  static async getAllPopularPost({
    user_id,
    limit,
    skip,
    sort,
    scope,
    sortBy
  }) {
    let condition = { scope, type: 'Post' };
    let foundPost = await this.findPostByAggregate({
      condition,
      me_id: user_id,
      limit,
      skip,
      sort,
      sortBy
    });
    return foundPost;
  }
  static async getAllPostForNewsFeed({ user_id, limit, skip, sort, scope }) {
    let condition = { scope };
    let foundPost = await this.findPostByAggregate({
      condition,
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
  static async getAllUserByPost({ type, post, owner_post, limit, skip, sort }) {
    const result = await PostModel.aggregate([
      {
        $match: {
          _id: new ObjectId(post),
          'post_attributes.user': new ObjectId(owner_post)
        }
      },
      {
        $sort: sort
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $unwind: `$post_attributes.${type}s`
      },
      {
        $lookup: {
          from: 'users',
          localField: `post_attributes.${type}s`,
          foreignField: '_id',
          as: `post_attributes.${type}s`
        }
      },
      {
        $lookup: {
          from: 'friends',
          let: { id: `post_attributes.${type}s._id` },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$id'] },
                    { $in: [new ObjectId(me_id), '$friends'] }
                  ]
                }
              }
            }
          ],
          as: 'friend'
        }
      },
      {
        $addFields: {
          'post_attributes.user.is_friend': {
            $cond: {
              if: { $gt: [{ $size: '$friend' }, 0] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          friend: 0,
          [`post_attributes.${type}s`]: 1
        }
      }
    ]);

    return result.map(doc => doc.post_attributes[`${type}s`]);
  }
  static async deletePost({ post_id }) {
    return await PostModel.findByIdAndDelete(post_id).lean();
  }
  static async updatePost({ post_id, user_id, payload }) {
    const postUpdate = await PostModel.findByIdAndUpdate(
      post_id,
      payload
    ).lean();

    const result = await this.findPostByAggregate({
      condition: { _id: postUpdate._id },
      me_id: user_id,
      isFullSearch: true
    });

    return result[0];
  }
  static async sharePost({ type = 'Share', user, post, owner_post, content, hashtags }) {
    const post_attributes = { user, post, owner_post, content, hashtags };

    let numShare = 1;

    const postShare = await PostModel.create({ type, post_attributes });

    this.changeToArrayPost({
      post_id: post,
      type: 'share',
      number: numShare,
      user_id: user
    });

    return {
      numShare,
      postShare
    };
  }

  static async deleteSharePost({ type = 'Share', user, post, shared_post }) {
    // Kiểm tra xem đã share bài viết này chưa
    const sharedPost = await this.checkExist({
      _id: shared_post,
      'post_attributes.user': user,
      'post_attributes.post': post,
      type
    });

    let numShare = 1;

    if (sharedPost) {
      await Promise.resolve(PostModel.deleteOne(sharedPost._id));
      numShare = -1;

      this.changeToArrayPost({
        post_id: post,
        type: 'share',
        number: numShare,
        user_id: user
      });
    }

    return {
      numShare
    };
  }
  static async getAllPost({ limit, skip, sort }) {
    let posts = PostModel.find().skip(skip).limit(limit).sort(sort);
    return await this.populatePostShare(posts);
  }
  static async getAllPostByUserId({
    user_id,
    me_id,
    limit,
    skip,
    sort,
    scope,
    isFullSearch = false
  }) {
    let condition = { 'post_attributes.user': new ObjectId(user_id), scope };
    let foundPost = await this.findPostByAggregate({
      condition,
      me_id,
      limit,
      skip,
      isFullSearch,
      sort
    });
    return foundPost;
  }

  static async searchPosts({
    search,
    me_id,
    limit,
    skip,
    sort,
    isFullSearch = false
  }) {
    const friends = await FriendClass.getAllFriends({ user_id: me_id });

    const searchRegex = { $regex: search, $options: 'i' };
    const userSearch = { 'post_attributes.user': new ObjectId(me_id) };
    const friendSearch = { 'post_attributes.user': { $in: friends } };
    const publicVisibility = { visibility: { $eq: 'public' } };
    const nonPrivateVisibility = { visibility: { $ne: 'private' } };

    let condition = {
      $or: [
        { $and: [{ 'post_attributes.title': searchRegex }, publicVisibility] },
        { $and: [userSearch, { 'post_attributes.title': searchRegex }] },
        {
          $and: [
            friendSearch,
            nonPrivateVisibility,
            { 'post_attributes.content': searchRegex }
          ]
        },
        {
          $and: [{ 'post_attributes.content': searchRegex }, publicVisibility]
        },
        { $and: [userSearch, { 'post_attributes.content': searchRegex }] },
        {
          $and: [
            friendSearch,
            nonPrivateVisibility,
            { 'post_attributes.content': searchRegex }
          ]
        }
      ]
    };
    let foundPost = await this.findPostByAggregate({
      condition,
      me_id,
      limit,
      skip,
      isFullSearch,
      sort
    });
    return foundPost;
  }

  static async findByID({
    post_id,
    user,
    scope = 'Normal',
    isFullSearch = false
  }) {
    let condition = {
      _id: new ObjectId(post_id),
      scope
    };
    let foundPost = await this.findPostByAggregate({
      condition,
      me_id: user,
      isFullSearch
    });
    return foundPost[0];
  }
  static async findPostByAggregate({
    condition,
    me_id,
    limit = 1,
    skip = 0,
    sort = { createdAt: -1 },
    isFullSearch = false,
    sortBy
  }) {
    const friends = await FriendClass.getAllFriends({ user_id: me_id });
    const additionalCondition2 = {
      $match: {
        $or: [
          { visibility: 'public' },
          {
            visibility: 'friend',
            'post_attributes.user': { $in: friends }
          }
        ]
      }
    };

    const aggregatePipeline = [
      { $match: condition },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },

      { $addFields: { ...addFieldsObject(me_id) } },
      // ================== user ==================
      choosePopulateAttr({
        from: 'users',
        attribute: 'user',
        select: getSelectData(se_UserDefaultForPost)
      }),
      getFirstElement('user'),
      // ================== owner_post ==================
      choosePopulateAttr({
        from: 'users',
        attribute: 'owner_post',
        select: getSelectData(se_UserDefaultForPost)
      }),
      getFirstElement('owner_post'),
      // ================== post ==================
      choosePopulateAttr({
        from: 'posts',
        attribute: 'post',
        select: unGetSelectData(unSe_PostDefault)
      }),
      getFirstElement('post'),

      // ===========================================

      {
        $addFields: {
          'post_attributes.user.is_friend': {
            $cond: {
              if: { $in: ['$post_attributes.user', friends] },
              then: true,
              else: false
            }
          }
        }
      },

      { $project: { ...unGetSelectData(unSe_PostDefault) } }
    ];

    if (!isFullSearch) {
      aggregatePipeline.unshift(additionalCondition2);
    }

    let foundPost = await PostModel.aggregate(aggregatePipeline);

    foundPost.map(post => {
      if (post.type === 'Post') {
        delete post.post_attributes.post;
        delete post.post_attributes.owner_post;
      }
    });

    foundPost = foundPost.filter(item => {
      const date = new Date(item.createdAt);
      const dateNow = new Date();
      const diffTime = Math.abs(dateNow.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (sortBy === 'Today') {
        return diffDays <= 1;
      }
      if (sortBy === 'This week') {
        return diffDays <= 7;
      }
      if (sortBy === 'This month') {
        return diffDays <= 30;
      }
      if (sortBy === 'This year') {
        return diffDays <= 365;
      }
      if (sortBy === 'All time') {
        return true;
      }
      return true;
    });

    return foundPost;
  }
  static async createPost({
    type,
    user,
    content,
    images,
    hashtags,
    tags,
    scope,
    community,
    visibility
  }) {
    const post_attributes = { user, content, images, hashtags, tags };
    const newPost = await PostModel.create({
      type,
      scope,
      community,
      visibility,
      post_attributes
    });

    const result = await this.findPostByAggregate({
      condition: { _id: newPost._id },
      me_id: user,
      isFullSearch: true
    });

    return result[0];
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
  // type = ['like', 'share', 'save', 'comment', 'view']
  // number = 1 or -1
  static async changeToArrayPost({ post_id, type, user_id, number }) {
    let stringUpdateArr = 'post_attributes.' + type + 's';
    let stringUpdateNum = 'post_attributes.' + type + '_number';

    let operator = number === 1 ? '$addToSet' : '$pull';
    return await PostModel.findByIdAndUpdate(
      post_id,
      {
        [operator]: {
          [stringUpdateArr]: user_id
        },
        $inc: {
          [stringUpdateNum]: number
        }
      },
      { new: true }
    );
  }
  static async checkExist(select) {
    return await PostModel.findOne(select).lean();
  }
  // ================= ADMIN =================
  static async getAllPosts_admin({ limit, page, sort }) {
    const skip = (page - 1) * limit;
    return await PostModel.find({
      type: 'Post', scope: 'Normal'
    })
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate('post_attributes.user', pp_UserDefault)
      .lean();
  }
  static async findPostById_admin({ post_id }) {
    return await PostModel.findById(post_id);
  }
  static async updatePost_admin({ post_id, visibility, post_attributes }) {
    return await PostModel.findByIdAndUpdate(
      post_id,
      { visibility, ...post_attributes },
      {
        new: true
      }
    ).lean();
  }
  static async deletePost_admin({ post_id }) {
    return await PostModel.findByIdAndDelete(post_id).lean();
  }
  static async getPostNumber_admin() {
    return await PostModel.countDocuments({ type: 'Post' });
  }
}

//Export the model
export { PostClass, PostModel };
