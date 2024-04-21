'use strict';

const PostService = require('../services/post.service');
const { OK, CREATED } = require('../core/success.response');

class PostController {
  static async getAllImage(req, res, next) {
    new OK({
      message: 'Get All Image Of Post Successfully',
      metadata: await PostService.getAllImage({
        user_id: req.params.user_id
      })
    }).send(res);
  }

  static async getSavedPosts(req, res, next) {
    new OK({
      message: 'Get Saved Posts Successfully',
      metadata: await PostService.getSavedPosts({
        user_id: req.user.userId,
        page: req.query.page
      })
    }).send(res);
  }
  static viewPost = async (req, res, next) => {
    new OK({
      message: 'View Post Successfully',
      metadata: await PostService.viewPost({
        res,
        cookies: req.cookies,
        post_id: req.params.post_id,
        user_id: req.user.userId
      })
    }).send(res);
  };
  /* 
    Get All Popular Post
    Link: http://localhost:4052/api/v1/posts/popular
  */
  static getAllPopularPost = async (req, res, next) => {
    new OK({
      message: 'Get All Popular Post Successfully',
      metadata: await PostService.getAllPopularPost({
        user_id: req.user.userId,
        sortBy: req.query.sortBy
      })
    }).send(res);
  };
  /* 
    Get All Post For NewsFeed
    Link: http://localhost:4052/api/v1/posts/newsfeed
  */
  static getAllPostForNewsFeed = async (req, res, next) => {
    new OK({
      message: 'Get All Post For NewsFeed Successfully',
      metadata: await PostService.getAllPostForNewsFeed({
        user_id: req.user.userId,
        page: req.query.page
      })
    }).send(res);
  };
  /* 
    Get All User Share Post
    Link: http://localhost:4052/api/v1/posts/share/:post_id
    {
      "owner_post": "64feb8ca5d0b62edec58183b"
    }
  */
  static getAllUserSharePost = async (req, res, next) => {
    new OK({
      message: 'Get All User Share Post Successfully',
      metadata: await PostService.getAllUserSharePost({
        ...req.body,
        post: req.params.post_id
      })
    }).send(res);
  };
  /* 
    Get All User Like Post
    Link: http://localhost:4052/api/v1/posts/like/:post_id
    {
      "owner_post": "64feb8ca5d0b62edec58183b"
    }
  */
  static getAllUserLikePost = async (req, res, next) => {
    new OK({
      message: 'Get All User Like Post Successfully',
      metadata: await PostService.getAllUserLikePost({
        ...req.body,
        post: req.params.post_id
      })
    }).send(res);
  };
  /* 
    Get All User Save Post
    Link: http://localhost:4052/api/v1/posts/save/:post_id
  */
  static getAllUserSavePost = async (req, res, next) => {
    new OK({
      message: 'Get All User Like Post Successfully',
      metadata: await PostService.getAllUserSavePost({
        ...req.body,
        post: req.params.post_id
      })
    }).send(res);
  };
  /* 
    Delete Post
    Link: http://localhost:4052/api/v1/posts/delete/:post_id
  */
  static deletePost = async (req, res, next) => {
    new OK({
      message: 'Delete Post Successfully',
      metadata: await PostService.deletePost({
        ...req.body,
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
        ...req.body,
        post_id: req.params.post_id,
        user_id: req.user.userId
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
        user_id: req.user.userId,
        page: req.query.page
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
        user_id: req.params.user_id,
        me_id: req.user.userId,
        page: req.query.page
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
        post_id: req.params.post_id,
        user: req.user.userId
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
        ...req.body,
        user: req.user.userId
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
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };

  /* 
    Get Posts By Title
    Link: http://localhost:4052/api/v1/posts/search/top?search=con
  */
  static searchPosts = async (req, res, next) => {
    new OK({
      message: 'Get Posts By Title Successfully',
      metadata: await PostService.searchPosts({
        search: req.query.search,
        page: req.query.page,
        me_id: req.user.userId
      })
    }).send(res);
  };
}

module.exports = PostController;
