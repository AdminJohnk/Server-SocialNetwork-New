'use strict';

const PostService = require('../services/post.service');
const { OK, CREATED } = require('../core/success.response');

class PostController {
  /* 
    Delete Post
    Link: http://localhost:4052/api/v1/posts/delete/:post_id
  */
  static deletePost = async (req, res, next) => {
    new OK({
      message: 'Delete Post Successfully',
      metadata: await PostService.deletePost({
        post_id: req.params.post_id,
        user_id: req.user.userId
      })
    }).send(res);
  };
  /* 
    Update Post
    Link: http://localhost:4052/api/v1/posts/update/:post_id
    {
        "title":"123 MARKETER TỰ LẤY ĐƯỢC DATA?",
        "content":"123 Redux: Redux là một thư viện quản lý trạng thái (state management) của   ứng dụng ReactJS. "
    }
  */
  static updatePost = async (req, res, next) => {
    new OK({
      message: 'Update Post Successfully',
      metadata: await PostService.updatePost({
        post_id: req.params.post_id,
        user_id: req.user.userId,
        post_attibutes: { ...req.body }
      })
    }).send(res);
  };

  /* 
    Get All Post
    http://localhost:4052/api/v1/posts/all 
  */
  static getAllPost = async (req, res, next) => {
    new OK({
      message: 'Get All Post Successfully',
      metadata: await PostService.getAllPost({
        user_id: req.user.userId
      })
    }).send(res);
  };

  /* 
    Get All Post By User ID
    http://localhost:4052/api/v1/posts/user/:user_id
     */
  static getAllPostByUserId = async (req, res, next) => {
    new OK({
      message: 'Get Post Successfully',
      metadata: await PostService.getAllPostByUserId({
        user_id: req.params.user_id
      })
    }).send(res);
  };

  /*  
    Get Post By ID
    Link: http://localhost:4052/api/v1/posts/find/:post_id 
  */
  static getPostById = async (req, res, next) => {
    new OK({
      message: 'Get Post Successfully',
      metadata: await PostService.getPostById({
        post_id: req.params.post_id
      })
    }).send(res);
  };
  /* 
    Share Post
    Link: http://localhost:4052/api/v1/posts/share
    {
      "owner_post":"64fc14818dc25f31e5c4f5ac",
      "post":"64fcb3b32ca9a1e8f2880ff8"
    }
    */
  static sharePost = async (req, res, next) => {
    new CREATED({
      message: 'Share Post Successfully',
      metadata: await PostService.sharePost({
        post_attibutes: {
          ...req.body,
          user: req.user.userId
        }
      })
    }).send(res);
  };

  /* 
    Create Post
    Link: http://localhost:4052/api/v1/posts
    {
      "title":"con heo mập",
      "content":"Con mập heo"
    }
  */
  static createPost = async (req, res, next) => {
    new CREATED({
      message: 'Create Post Successfully',
      metadata: await PostService.createPost({
        post_attibutes: { ...req.body, user: req.user.userId }
      })
    }).send(res);
  };
}

module.exports = PostController;
