'use strict';

import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../core/error.response.js';
import { hash } from 'bcrypt';
import { UserClass, RoleUser } from '../models/user.model.js';
import { PostClass } from '../models/post.model.js';
import { removeFalsyFields, updateNestedObjectParser } from '../utils/functions.js';
import { ParentCommentClass } from '../models/parentComment.model.js';
import { ChildCommentClass } from '../models/childComment.model.js';
import NotificationService from './notification.service.js';
import { Notification } from '../utils/notificationType.js';
import PublisherService from './publisher.service.js';
import { CommunityClass } from '../models/community.model.js';
const { CREATEPOST_001 } = Notification;

class AdminService {
  // ======================== Comment ========================
  static deleteComment = async ({ comment_id, post, user, type }) => {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    if (type === 'parent') {
      const foundComment = await ParentCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundComment) throw new NotFoundError('Comment not found');

      // Xóa comment cha
      const result = await ParentCommentClass.deleteComment_admin({
        comment_id
      });

      // Xóa tất cả comment con
      let { deletedCount } = await ChildCommentClass.deleteByParentID({
        parent: comment_id,
        post
      });
      deletedCount++;

      // Cập nhật số comment của post
      PostClass.changeToArrayPost({
        post_id: post,
        type: 'comment',
        number: -deletedCount,
        user_id: user
      });
      return result;
    } else if (type === 'child') {
      const foundComment = await ChildCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundComment) throw new NotFoundError('Comment not found');

      const result = await ChildCommentClass.deleteComment_admin({
        comment_id
      });

      // Cập nhật số lượng comment con của comment cha
      ParentCommentClass.changeNumberComment({
        comment_id: foundComment.parent,
        type: 'child',
        number: -1
      });

      // Cập nhật số comment của post
      PostClass.changeToArrayPost({
        post_id: post,
        type: 'comment',
        number: -1,
        user_id: user
      });

      return result;
    } else {
      throw new BadRequestError('Type of comment is invalid');
    }
  };
  static updateComment = async ({ comment_id, content, type }) => {
    if (type === 'parent') {
      const foundComment = await ParentCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundComment) throw new NotFoundError('Comment not found');

      return await ParentCommentClass.updateComment_admin({
        comment_id,
        content
      });
    } else if (type === 'child') {
      const foundComment = await ChildCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundComment) throw new NotFoundError('Comment not found');
      return await ChildCommentClass.updateComment_admin({
        comment_id,
        content
      });
    } else {
      throw new BadRequestError('Type of comment is invalid');
    }
  };
  static getAllParentComments = async ({ post, limit = 10, page = 1, sort = { createdAt: -1 } }) => {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await ParentCommentClass.getAllParentComments_admin({
      post,
      limit,
      page,
      sort
    });
  };
  static getAllChildComments = async ({ parent, limit = 10, page = 1, sort = { createdAt: -1 } }) => {
    const foundComment = await ParentCommentClass.checkExist({ _id: parent });
    if (!foundComment) throw new NotFoundError('Comment not found');

    return await ChildCommentClass.getAllChildComments_admin({
      parent,
      limit,
      page,
      sort
    });
  };
  // ======================== Post ========================
  static async getPostNumber() {
    return await PostClass.getPostNumber_admin();
  }
  static async createPost({ type = 'Post', email, title, content, images, scope, community, visibility }) {
    const foundUser = await UserClass.checkExist({ email });
    if (!foundUser) throw new NotFoundError('User not found');

    const user = foundUser._id.toString();

    if (!title || !content) throw new BadRequestError('Post must have title or content');
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

    const result = await PostClass.deletePost_admin({ post_id });

    // Xóa post trong community
    if (scope === 'Community') {
      await CommunityClass.changeToArrayCommunity({
        community_id: community,
        type: 'post',
        itemID: result._id,
        number: -1
      });
    }

    UserClass.changeNumberUser({
      user_id,
      type: 'post',
      number: -1
    }).catch((err) => console.log(err));

    return result;
  };
  static updatePost = async ({ post_id, content, title, images, visibility }) => {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) throw new NotFoundError('Post not found');

    let post_attributes = { content, title, images };
    post_attributes = removeFalsyFields(post_attributes);

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
  static getAllPosts = async ({ limit = 10, page = 1, sort = { updatedAt: -1 } }) => {
    return await PostClass.getAllPosts_admin({ limit, page, sort });
  };

  // ======================== User ========================
  static getUserNumber = async () => {
    return await UserClass.getUserNumber_admin();
  };
  static createUser = async ({ name, email, password }) => {
    const foundUser = await UserClass.checkExist({ email });
    if (foundUser) throw new ConflictRequestError('Email already exist');

    const passwordHash = await hash(password, 10);

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
  static getAllUsers = async ({ limit = 10, page = 1, sort = { updatedAt: -1 } }) => {
    return await UserClass.getAllUsers_admin({ limit, page, sort });
  };
  static deleteUser = async ({ user_id }) => {
    const foundUser = await UserClass.checkExist({ _id: user_id });
    if (!foundUser) throw new NotFoundError('User not found');

    return await UserClass.deleteUser_admin({ user_id });
  };
}

export default AdminService;
