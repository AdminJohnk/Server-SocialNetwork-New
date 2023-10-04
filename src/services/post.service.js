'use strict';

const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../core/error.response');
const {
  getInfoData,
  limitData,
  removeUndefinedFields,
  updateNestedObjectParser
} = require('../utils/functions');
const axios = require('axios');
const { RoleUser } = require('../utils/constants');
const { PostClass } = require('../models/post.model');
const { UserClass } = require('../models/user.model');
const { LikeClass } = require('../models/like.model');
const NotificationService = require('./notification.service');
const PublisherService = require('./publisher.service');
const { Notification } = require('../utils/notificationType');
const { CREATEPOST_001 } = Notification;

class PostService {
  static async viewPost({ post_id, user_id, cookies, res }) {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.viewPost({ post_id, user_id, cookies, res });
  }
  static async getAllPopularPost({
    user_id,
    limit = 3,
    page = 1,
    sort = { createdAt: -1 }
  }) {
    const skip = (page - 1) * limit;

    return await PostClass.getAllPopularPost({ user_id, limit, skip, sort });
  }
  static async getAllPostForNewsFeed({
    user_id,
    limit = 4,
    page = 1,
    sort = { createdAt: -1 }
  }) {
    const skip = (page - 1) * limit;

    return await PostClass.getAllPostForNewsFeed({
      user_id,
      limit,
      skip,
      sort
    });
  }
  static async getAllUserSavePost({
    post,
    owner_post,
    limit = 10,
    page = 1,
    sort = { createdAt: -1 }
  }) {
    const skip = (page - 1) * limit;

    const foundPost = await PostClass.checkExist({
      _id: post,
      'post_attributes.user': owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.getAllUserSavePost({
      post,
      owner_post,
      limit,
      skip,
      sort
    });
  }
  static async getAllUserSharePost({
    post,
    owner_post,
    limit = 10,
    page = 1,
    sort = { createdAt: -1 }
  }) {
    const skip = (page - 1) * limit;

    const foundPost = await PostClass.checkExist({
      _id: post,
      'post_attributes.user': owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.getAllUserSharePost({
      post,
      owner_post,
      limit,
      skip,
      sort
    });
  }
  static async getAllUserLikePost({
    post,
    owner_post,
    limit = 10,
    page = 1,
    sort = { createdAt: -1 }
  }) {
    const skip = (page - 1) * limit;

    const foundPost = await PostClass.checkExist({
      _id: post,
      'post_attributes.user': owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.getAllUserLikePost({
      post,
      owner_post,
      limit,
      skip,
      sort
    });
  }
  static async deletePost({ post_id, user_id }) {
    const foundPost = await PostClass.checkExist({
      _id: post_id,
      'post_attributes.user': user_id
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    const result = await PostClass.deletePost({ post_id });

    UserClass.changeNumberUser({
      user_id: me_id,
      type: 'post',
      number: -1
    }).catch(err => console.log(err));

    return result;
  }
  static async updatePost({ post_id, user_id, post_attributes }) {
    const foundPost = await PostClass.checkExist({
      _id: post_id,
      'post_attributes.user': user_id
    });
    if (!foundPost) throw new NotFoundError('Post not found');
    post_attributes = removeUndefinedFields(post_attributes);

    return await PostClass.updatePost({
      post_id,
      user_id,
      post_attributes: updateNestedObjectParser({
        post_attributes: post_attributes
      })
    });
  }
  static async getAllPost({ user_id, limit = 10, page = 1, sort = 'ctime' }) {
    const skip = (page - 1) * limit;
    const foundUser = await UserClass.checkExist({ _id: user_id });
    if (!foundUser.role.includes(RoleUser.ADMIN))
      throw new ForbiddenError('You do not have admin permission');

    return await PostClass.getAllPost({ limit, skip, sort });
  }
  static async getAllPostByUserId({
    user_id,
    me_id,
    limit = 4,
    page = 1,
    sort = { createdAt: -1 }
  }) {
    const foundUser = await UserClass.checkExist({ _id: user_id });
    if (!foundUser) throw new NotFoundError('User not found');

    const skip = (page - 1) * limit;

    return PostClass.getAllPostByUserId({ user_id, me_id, limit, skip, sort });
  }
  static async getPostById({ post_id, user }) {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.findByID({ post_id, user });
  }

  static async sharePost({ user, post, owner_post }) {
    const foundPost = await PostClass.checkExist({
      _id: post,
      'post_attributes.user': owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    const { numShare } = await PostClass.sharePost({ user, post, owner_post });

    PostClass.changeBehaviorPost({
      post_id: post,
      type: 'share',
      user_id: user,
      number: numShare
    });

    if (user !== owner_post && numShare === 1) {
      const msg = NotificationService.createMsgToPublish({
        type: SHAREPOST_001,
        sender: user,
        receiver: owner_post,
        post: post
      });

      PublisherService.publishNotify(msg);
    }

    return true;
  }
  static async createPost({ type = 'Post', user, title, content }) {
    if (!title || !content)
      throw new BadRequestError('Post must have title or content');
    const result = await PostClass.createPost({ type, user, title, content });

    UserClass.changeNumberUser({
      user_id: user,
      type: 'post',
      number: 1
    });

    const msg = NotificationService.createMsgToPublish({
      type: CREATEPOST_001,
      sender: user,
      post: result._id
    });

    PublisherService.publishNotify(msg);
    // return true;
    return result;
  }
}

module.exports = PostService;
