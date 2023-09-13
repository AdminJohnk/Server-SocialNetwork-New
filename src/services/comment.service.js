'use strict';

const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../core/error.response');

const { ParentCommentClass } = require('../models/parentComment.model');
const { ChildCommentClass } = require('../models/childComment.model');
const { PostClass } = require('../models/post.model');

class CommentService {
  static async likeComment({ comment_id, post, user, type }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    if (type === 'parent') {
      const foundParentComment = await ParentCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundParentComment)
        throw new NotFoundError('Parent comment not found');

      return await ParentCommentClass.likeComment({
        comment_id,
        post,
        user
      });
    } else if (type === 'child') {
      const foundChildComment = await ChildCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundChildComment)
        throw new NotFoundError('Child comment not found');

      return await ChildCommentClass.likeComment({
        comment_id,
        post,
        user
      });
    } else throw new BadRequestError('Type is not valid');
  }
  static async updateComment({ comment_id, post, user, content, type }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    if (content === '') throw new BadRequestError('Content is empty');

    if (type === 'parent') {
      const foundParentComment = await ParentCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundParentComment)
        throw new NotFoundError('Parent comment not found');

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
      if (!foundChildComment)
        throw new NotFoundError('Child comment not found');

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
      if (!foundParentComment)
        throw new NotFoundError('Parent comment not found');

      return await ParentCommentClass.deleteByID({ comment_id, post, user });
    } else if (type === 'child') {
      const foundChildComment = await ChildCommentClass.checkExist({
        _id: comment_id
      });
      if (!foundChildComment)
        throw new NotFoundError('Child comment not found');

      return await ChildCommentClass.deleteByID({ comment_id, post, user });
    } else throw new BadRequestError('Type is not valid');
  }
  static async getAllChildByParentID({
    post,
    parent,
    limit = 4,
    page = 1,
    sort = 'ctime'
  }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    const foundParentComment = await ParentCommentClass.checkExist({
      _id: parent
    });
    if (!foundParentComment)
      throw new NotFoundError('Parent comment not found');

    return await ChildCommentClass.getAllChildByParentID({
      post,
      parent,
      limit,
      page,
      sort
    });
  }
  static async getAllParentComments({
    post,
    limit = 4,
    page = 1,
    sort = 'ctime'
  }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await ParentCommentClass.getAllParentComments({
      post,
      limit,
      page,
      sort
    });
  }
  static async commentPost({ type, post, user, content, parent }) {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    if (content === '') throw new BadRequestError('Content is empty');

    if (type === 'parent')
      return await ParentCommentClass.createComment({ post, user, content });
    else if (type === 'child') {
      const foundParentComment = await ParentCommentClass.checkExist({
        _id: parent
      });
      if (!foundParentComment)
        throw new NotFoundError('Parent comment not found');

      return await ChildCommentClass.createComment({
        post,
        user,
        content,
        parent
      });
    } else throw new BadRequestError('Type is not valid');
  }
}

module.exports = CommentService;
