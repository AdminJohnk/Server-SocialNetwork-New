'use strict';

const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../core/error.response');
const bcrypt = require('bcrypt');
const { UserClass, RoleUser } = require('../models/user.model');
const { PostClass } = require('../models/post.model');
const {
  removeUndefinedFields,
  updateNestedObjectParser
} = require('../utils/functions');
const { ParentCommentClass } = require('../models/parentComment.model');
const { ChildCommentClass } = require('../models/childComment.model');

class AdminService {
  // ======================== Comment ========================
  static getAllChildByParentID = async ({
    post,
    parent,
    limit = 20,
    page = 1,
    sort = { createdAt: -1 }
  }) => {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    const foundParentComment = await ParentCommentClass.checkExist({
      _id: parent
    });
    if (!foundParentComment)
      throw new NotFoundError('Parent comment not found');

    return await ChildCommentClass.getAllChildByParentID_admin({
      post,
      parent,
      limit,
      page,
      sort
    });
  };
  static getAllParentComments = async ({
    post,
    limit = 20,
    page = 1,
    sort = { createdAt: -1 }
  }) => {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await ParentCommentClass.getAllParentComments_admin({
      post,
      limit,
      page,
      sort
    });
  };
  // ======================== Post ========================
  static deletePost = async ({ post_id }) => {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.deletePost_admin({ post_id });
  };
  static updatePost = async ({ post_id, content, title }) => {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) throw new NotFoundError('Post not found');

    let post_attributes = { content, title };
    post_attributes = removeUndefinedFields(post_attributes);

    return await PostClass.updatePost_admin({
      post_id,
      post_attributes: updateNestedObjectParser({
        post_attributes: post_attributes
      })
    });
  };
  static findPostById = async ({ post_id }) => {
    return await PostClass.findPostById_admin({ post_id });
  };
  static getAllPosts = async ({
    limit = 20,
    page = 1,
    sort = { updatedAt: -1 }
  }) => {
    return await PostClass.getAllPosts_admin({ limit, page, sort });
  };

  // ======================== User ========================
  static createUser = async ({ name, email, password }) => {
    const foundUser = await UserClass.checkExist({ email });
    if (foundUser) throw new ConflictRequestError('Email already exist');

    const passwordHash = await bcrypt.hash(password, 10);

    return await UserClass.createUser_admin({
      name,
      email,
      password: passwordHash
    });
  };
  static findUserById = async ({ user_id }) => {
    return await UserClass.findUserById_admin({ user_id });
  };
  static updateUser = async ({ user_id, payload }) => {
    const foundUser = await UserClass.checkExist({ _id: user_id });
    if (!foundUser) throw new NotFoundError('User not found');

    return await UserClass.updateUser_admin({ user_id, payload });
  };
  static getAllUsers = async ({
    limit = 20,
    page = 1,
    sort = { updatedAt: -1 }
  }) => {
    return await UserClass.getAllUsers_admin({ limit, page, sort });
  };
  static deleteUser = async ({ user_id }) => {
    const foundUser = await UserClass.checkExist({ _id: user_id });
    if (!foundUser) throw new NotFoundError('User not found');

    return await UserClass.deleteUser_admin({ user_id });
  };
}

module.exports = AdminService;
