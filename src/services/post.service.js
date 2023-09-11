'use strict';

const {
  ConflicRequestError,
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
} = require('../utils');
const axios = require('axios');
const { PostClass } = require('../models/post.model');
const { UserClass, RoleUser } = require('../models/user.model');

class PostService {
  static async deletePost({ post_id, user_id }) {
    const foundPost = await PostClass.checkExist({
      _id: post_id,
      'post_attibutes.user': user_id
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.deletePost({ post_id });
  }
  static async updatePost({ post_id, user_id, post_attibutes }) {
    const foundPost = await PostClass.checkExist({
      _id: post_id,
      'post_attibutes.user': user_id
    });
    if (!foundPost) throw new NotFoundError('Post not found');
    post_attibutes = removeUndefinedFields(post_attibutes);

    return await PostClass.updatePost({
      post_id,
      post_attibutes: updateNestedObjectParser({
        post_attibutes: post_attibutes
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
    limit = 8,
    page = 1,
    sort = 'ctime'
  }) {
    const foundUser = await UserClass.checkExist({ _id: user_id });
    if (!foundUser) throw new NotFoundError('User not found');

    const skip = (page - 1) * limit;

    return PostClass.getAllPostByUserId({ user_id, limit, skip, sort });
  }
  static async getPostById({ post_id }) {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) throw new NotFoundError('Post not found');

    return PostClass.findByID({ post_id });
  }
  static async sharePost({ type = 'Share', post_attibutes = {} }) {
    const foundPost = await PostClass.checkExist({
      _id: post_attibutes.post,
      'post_attibutes.user': post_attibutes.owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    return PostClass.sharePost({ type, post_attibutes });
  }
  static createPost({ type = 'Post', post_attibutes = {} }) {
    if (!post_attibutes.title || !post_attibutes.content)
      throw new BadRequestError('Post must have title or content');
    return PostClass.createPost({ type, post_attibutes });
  }
}

module.exports = PostService;