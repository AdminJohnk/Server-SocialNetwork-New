'use strict';

const CommentService = require('../services/comment.service');
const { OK, CREATED } = require('../core/success.response');

class CommentController {
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
    }
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
      metadata: await CommentService.getAllChildByParentID(req.body)
    }).send(res);
  }
  /* 
    Get All Parent Comments
    Link: http://localhost:4052/api/v1/comments//parents/:post_id
  */
  static getAllParentComments = async (req, res, next) => {
    new OK({
      message: 'Get All Parent Comments Successfully',
      metadata: await CommentService.getAllParentComments({
        post: req.params.post_id
      })
    }).send(res);
  };
  /* 
    Comment Post
    Link: http://localhost:4052/api/v1/comments/create
    {
        "type": "parent",
        "post": "64ff0ed21c99a31a0e80d44e",
        "content" : "Comment 1"
    }
    {
        "type": "child",
        "post": "64ff0ed21c99a31a0e80d44e",
        "content" : "Reply Comment 1",
        "parent": "65002b546ab43bb5c453d86c"
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

module.exports = CommentController;
