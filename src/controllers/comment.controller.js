'use strict';

import CommentService from '../services/comment.service.js';
import { OK, CREATED } from '../core/success.response.js';

class CommentController {
  /* 
    Dislike Comment
    Link: http://localhost:4052/api/v1/comments/dislike/:comment_id
    {
      "type" : "child",
      "post": "64ff0ed21c99a31a0e80d44e",
      "owner_comment": "650ac1e3f3563200db3b434b"
    }
  */
  static dislikeComment = async (req, res, next) => {
    new OK({
      message: 'Dislike Comment Successfully',
      metadata: await CommentService.dislikeComment({
        ...req.body,
        user: req.user.userId,
        comment_id: req.params.comment_id
      })
    }).send(res);
  };
  /* 
    Like Comment
    Link: http://localhost:4052/api/v1/comments/like/:comment_id
    {
      "type" : "child",
      "post": "64ff0ed21c99a31a0e80d44e",
      "owner_comment": "650ac1e3f3563200db3b434b"
    }
  */
  static likeComment = async (req, res, next) => {
    new OK({
      message: 'Like Comment Successfully',
      metadata: await CommentService.likeComment({
        ...req.body,
        user: req.user.userId,
        comment_id: req.params.comment_id
      })
    }).send(res);
  };
  /* 
        Update Comment
        Link: http://localhost:4052/api/v1/comments/update/:comment_id
        {
            "type": "parent",
            "post": "64ff0ed21c99a31a0e80d44e",
            "content": "Comment 1 Update"
        }
    */
  static updateComment = async (req, res, next) => {
    new OK({
      message: 'Update Comment Successfully',
      metadata: await CommentService.updateComment({
        ...req.body,
        user: req.user.userId,
        comment_id: req.params.comment_id
      })
    }).send(res);
  };
  /* 
        Delete Comments
        Link: http://localhost:4052/api/v1/comments/:comment_id
        {
            "type": "parent",
            "post" : "64ff0ed21c99a31a0e80d44e"
        }
    */
  static deleteComments = async (req, res, next) => {
    new OK({
      message: 'Delete Comments Successfully',
      metadata: await CommentService.deleteComments({
        ...req.body,
        user: req.user.userId,
        comment_id: req.params.comment_id
      })
    }).send(res);
  };
  /* 
    Get All Child Comments By Parent ID
    Link: http://localhost:4052/api/v1/comments/children
    {
        "post": "64ff0ed21c99a31a0e80d44e",
        "parent": "650037f666c317fe032c27c4"
    }
  */
  static getAllChildByParentID = async (req, res, next) => {
    new OK({
      message: 'Get All Child Comments Successfully',
      metadata: await CommentService.getAllChildByParentID({
        parent: req.params.parent_id,
        post: req.params.post_id,
        page: req.query.page,
        user: req.user.userId
      })
    }).send(res);
  };
  /* 
    Get All Parent Comments
    Link: http://localhost:4052/api/v1/comments//parents/:post_id
  */
  static getAllParentComments = async (req, res, next) => {
    new OK({
      message: 'Get All Parent Comments Successfully',
      metadata: await CommentService.getAllParentComments({
        post: req.params.post_id,
        user: req.user.userId
      })
    }).send(res);
  };
  /* 
    Comment Post
    Link: http://localhost:4052/api/v1/comments/create
    {
        "type": "parent",
        "post": "6513e9f518f3a421273c889f",
        "owner_post": "64fc1215bb5536f522ca979d",
        "content" : "Comment 1"
    }
    {
        "type": "child",
        "post": "650e959fd2a597e8c31ccee2",
        "owner_post": "64fc1215bb5536f522ca979d",
        "content" : "Comment 1",
        "parentUser":"650ac1e3f3563200db3b434b",
        "parent": "651408d2f2a12cdf3637f982"
     }
  */
  static commentPost = async (req, res, next) => {
    new CREATED({
      message: 'Comment Successfully',
      metadata: await CommentService.commentPost({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
}

export default CommentController;
