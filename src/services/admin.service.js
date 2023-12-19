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
const NotificationService = require('./notification.service');
const { Notification } = require('../utils/notificationType');
const PublisherService = require('./publisher.service');
const { CommunityClass } = require('../models/community.model');
const { CREATEPOST_001 } = Notification;

class AdminService {
  // ======================== Comment ========================
  static deleteComment = async ({ comment_id, type }) => {
    const foundComment = await ParentCommentClass.checkExist({
      _id: comment_id
    });
    if (!foundComment) throw new NotFoundError('Comment not found');

    if (type === 'parent') {
      return await ParentCommentClass.deleteComment_admin({ comment_id });
    } else if (type === 'child') {
      return await ChildCommentClass.deleteComment_admin({ comment_id });
    } else {
      throw new BadRequestError('Type of comment is invalid');
    }
  }
  static updateComment = async ({ comment_id, content, type }) => {
    const foundComment = await ParentCommentClass.checkExist({
      _id: comment_id
    });
    if (!foundComment) throw new NotFoundError('Comment not found');

    if (type === 'parent') {
      return await ParentCommentClass.updateComment_admin({
        comment_id,
        content
      });
    } else if (type === 'child') {
      return await ChildCommentClass.updateComment_admin({
        comment_id,
        content
      });
    } else {
      throw new BadRequestError('Type of comment is invalid');
    }
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
  static getAllChildComments = async ({ parent, limit, page, sort }) => {
    const foundComment = await ParentCommentClass.checkExist({ _id: parent });
    if (!foundComment) throw new NotFoundError('Comment not found');

    return await ChildCommentClass.getAllChildComments_admin({
      parent,
      limit,
      page,
      sort
    });
  }
  // ======================== Post ========================
  static async createPost({
    type = 'Post',
    email,
    title,
    content,
    images,
    scope,
    community,
    visibility
  }) {
    const foundUser = await UserClass.checkExist({ email });
    if (!foundUser) throw new NotFoundError('User not found');

    const user = foundUser._id.toString();

    if (!title || !content)
      throw new BadRequestError('Post must have title or content');
    const result = await PostClass.createPost({
      type,
      user,
      title,
      content,
      images,
      scope,
      community,
      visibility
    });

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

    // Thêm post trong community
    if (scope === 'Community') {
      await CommunityClass.changeToArrayCommunity({
        community_id: community,
        type: 'waitlist_post',
        itemID: result._id,
        number: 1
      });

      // Add notification for all member in community
    }

    return result;
  }
  static deletePost = async ({ post_id }) => {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.deletePost_admin({ post_id });
  };
  static updatePost = async ({
    post_id,
    content,
    title,
    images,
    visibility
  }) => {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) throw new NotFoundError('Post not found');

    let post_attributes = { content, title, images };
    post_attributes = removeUndefinedFields(post_attributes);

    return await PostClass.updatePost_admin({
      post_id,
      visibility,
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
