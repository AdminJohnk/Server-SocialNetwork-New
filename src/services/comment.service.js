'use strict';

import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../core/error.response.js';
import { ParentCommentClass } from '../models/parentComment.model.js';
import { ChildCommentClass } from '../models/childComment.model.js';
import { PostClass } from '../models/post.model.js';
import NotificationService from '../services/notification.service.js';
import { Notification } from '../utils/notificationType.js';
const { COMMENTPOST_001, REPLYCOMMENT_001, LIKECOMMENT_001, DISLIKECOMMENT_001 } = Notification;
import PublisherService from '../services/publisher.service.js';

class CommentService {
  static async dislikeComment({ comment_id, post, user, owner_comment, type }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    let number;

    if (type === 'parent') {
      const foundParentComment = await ParentCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundParentComment) throw new NotFoundError('Parent comment not found');

      const { dislike_number } = await ParentCommentClass.dislikeComment({
        comment_id,
        post,
        user
      });
      number = dislike_number;
    } else if (type === 'child') {
      const foundChildComment = await ChildCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundChildComment) throw new NotFoundError('Child comment not found');

      const { dislike_number } = await ChildCommentClass.dislikeComment({
        comment_id,
        post,
        user
      });

      number = dislike_number;
    } else throw new BadRequestError('Type is not valid');

    return true;
  }
  static async likeComment({ comment_id, post, user, owner_comment, type }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    let number;

    if (type === 'parent') {
      const foundParentComment = await ParentCommentClass.checkExist({
        _id: comment_id,
        user: owner_comment
      });
      if (!foundParentComment) throw new NotFoundError('Parent comment not found');

      const { like_number } = await ParentCommentClass.likeComment({
        comment_id,
        post,
        user
      });

      number = like_number;
    } else if (type === 'child') {
      const foundChildComment = await ChildCommentClass.checkExist({
        _id: comment_id,
        user: owner_comment
      });
      if (!foundChildComment) throw new NotFoundError('Child comment not found');

      const { like_number } = await ChildCommentClass.likeComment({
        comment_id,
        post,
        user
      });
      number = like_number;
    } else throw new BadRequestError('Type is not valid');

    if (user !== owner_comment && number === 1) {
      const msg = NotificationService.createMsgToPublish({
        type: LIKECOMMENT_001,
        sender: user,
        receiver: owner_comment,
        post: post,
        comment: comment_id,
        type_comment: type
      });

      // PublisherService.publishNotify(msg);
    }
    return true;
  }
  static async updateComment({ comment_id, post, user, content, type }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    if (content === '') throw new BadRequestError('Content is empty');

    if (type === 'parent') {
      const foundParentComment = await ParentCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundParentComment) throw new NotFoundError('Parent comment not found');

      return await ParentCommentClass.updateComment({
        comment_id,
        post,
        user,
        content
      });
    } else if (type === 'child') {
      const foundChildComment = await ChildCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundChildComment) throw new NotFoundError('Child comment not found');

      return await ChildCommentClass.updateComment({
        comment_id,
        post,
        user,
        content
      });
    } else throw new BadRequestError('Type is not valid');
  }
  static async deleteComments({ comment_id, type, post, user }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    if (type === 'parent') {
      const foundParentComment = await ParentCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundParentComment) throw new NotFoundError('Parent comment not found');

      // Xóa comment cha
      const result = await ParentCommentClass.deleteByID({
        comment_id,
        post,
        user
      });

      // Xóa tất cả comment con
      let { deletedCount } = await ChildCommentClass.deleteByParentID({
        parent: comment_id,
        post
      });
      deletedCount++;

      // Cập nhật số comment của post
      await PostClass.changeToArrayPost({
        post_id: post,
        type: 'comment',
        number: -deletedCount,
        user_id: user
      });
      return result;
    } else if (type === 'child') {
      const foundChildComment = await ChildCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundChildComment) throw new NotFoundError('Child comment not found');

      const result = await ChildCommentClass.deleteByID({
        comment_id,
        post,
        user
      });

      // Cập nhật số lượng comment con của comment cha
      await ParentCommentClass.changeNumberComment({
        comment_id: foundChildComment.parent,
        type: 'child',
        number: -1
      });

      // Cập nhật số comment của post
      await PostClass.changeToArrayPost({
        post_id: post,
        type: 'comment',
        number: -1,
        user_id: user
      });

      return result;
    } else throw new BadRequestError('Type is not valid');
  }
  static async getAllChildByParentID({ user, post, parent, limit = 4, page = 1, sort = { createdAt: -1 } }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    const foundParentComment = await ParentCommentClass.checkExist({
      _id: parent
    });
    if (!foundParentComment) throw new NotFoundError('Parent comment not found');

    return await ChildCommentClass.getAllChildByParentID({
      user,
      post,
      parent,
      limit,
      page,
      sort
    });
  }
  static async getAllParentComments({ user, post, limit = 4, page = 1, sort = { createdAt: -1 } }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await ParentCommentClass.getAllParentComments({
      user,
      post,
      limit,
      page,
      sort
    });
  }
  static async commentPost({ type, user, parentUser, post, owner_post, content, parent }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    if (content === '') throw new BadRequestError('Content is empty');

    let result;

    if (type === 'parent') {
      result = await ParentCommentClass.createComment({
        post,
        user,
        content
      });
    } else if (type === 'child') {
      const foundParentComment = await ParentCommentClass.checkExist({
        _id: parent
      });
      if (!foundParentComment) throw new NotFoundError('Parent comment not found');

      result = await ChildCommentClass.createComment({
        post,
        user,
        content,
        parent
      });

      // Cập nhật số lượng comment con của comment cha
      await ParentCommentClass.changeNumberComment({
        comment_id: parent,
        type: 'child',
        number: 1
      });

      // Nếu rep comment của người khác thì thông báo cho người đó. Nếu rep comment của chính mình thì không thông báo
      if (user !== parentUser) {
        // Thông báo cho người được rep comment
        const msg = NotificationService.createMsgToPublish({
          type: REPLYCOMMENT_001,
          sender: user,
          receiver: parentUser,
          post: post
        });
        PublisherService.publishNotify(msg);
      }
    } else throw new BadRequestError('Type is not valid');

    // Cập nhật số comment của post
    await PostClass.changeToArrayPost({
      post_id: post,
      type: 'comment',
      number: 1,
      user_id: user
    });

    if (user !== parentUser) {
      // Thông báo cho người đăng post
      const msg = NotificationService.createMsgToPublish({
        type: COMMENTPOST_001,
        sender: user,
        receiver: owner_post,
        post: post
      });
      PublisherService.publishNotify(msg);
    }
    return result;
  }
}

export default CommentService;
