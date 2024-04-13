'use strict';

import AdminService from '../services/admin.service.js';
import { OK, CREATED } from '../core/success.response.js';

class AdminController {
  static getPostNumber = async (req, res, next) => {
    new OK({
      message: 'Get Post Number Successfully',
      metadata: await AdminService.getPostNumber()
    }).send(res);
  };
  static getUserNumber = async (req, res, next) => {
    new OK({
      message: 'Get User Number Successfully',
      metadata: await AdminService.getUserNumber()
    }).send(res);
  };
  static deleteComment = async (req, res, next) => {
    new OK({
      message: 'Delete Comment Successfully',
      metadata: await AdminService.deleteComment({
        comment_id: req.params.comment_id,
        ...req.body
      })
    }).send(res);
  };
  static updateComment = async (req, res, next) => {
    new OK({
      message: 'Update Comment Successfully',
      metadata: await AdminService.updateComment({
        comment_id: req.params.comment_id,
        ...req.body
      })
    }).send(res);
  };
  static createPost = async (req, res, next) => {
    new CREATED({
      message: 'Create Post Successfully',
      metadata: await AdminService.createPost({
        ...req.body
      })
    }).send(res);
  };
  static createUser = async (req, res, next) => {
    new CREATED({
      message: 'Create User Successfully',
      metadata: await AdminService.createUser({
        ...req.body
      })
    }).send(res);
  };
  /* 
        Get All Parent Comments
        Link: http://localhost:4052/api/v1/admin/comments/parents/:post_id
    */
  static getAllParentComments = async (req, res, next) => {
    new OK({
      message: 'Get All Parent Comments Successfully',
      metadata: await AdminService.getAllParentComments({
        post: req.params.post_id
      })
    }).send(res);
  };
  /* 
        Get All Child Comments
        Link: http://localhost:4052/api/v1/admin/comments/children/:post_id/:parent_id
    */
  static getAllChildComments = async (req, res, next) => {
    new OK({
      message: 'Get All Child Comments Successfully',
      metadata: await AdminService.getAllChildComments({
        parent: req.params.parent_id
      })
    }).send(res);
  };
  /* 
        Delete Post
        Link: http://localhost:4052/api/v1/admin/posts/delete/:post_id
    */
  static deletePost = async (req, res, next) => {
    new OK({
      message: 'Delete Post Successfully',
      metadata: await AdminService.deletePost({
        post_id: req.params.post_id
      })
    }).send(res);
  };
  /* 
        Update Post
        Link: http://localhost:4052/api/v1/admin/posts/update/:post_id
    */
  static updatePost = async (req, res, next) => {
    console.log('req.body', req.body);
    new OK({
      message: 'Update Post Successfully',
      metadata: await AdminService.updatePost({
        post_id: req.params.post_id,
        ...req.body
      })
    }).send(res);
  };
  /* 
        Find Post By Id
        Link: http://localhost:4052/api/v1/admin/posts/find/:post_id
    */
  static findPostById = async (req, res, next) => {
    new OK({
      message: 'Find Post By Id Successfully',
      metadata: await AdminService.findPostById({
        post_id: req.params.post_id
      })
    }).send(res);
  };
  /* 
        Get All Posts
        Link: http://localhost:4052/api/v1/admin/posts
    */
  static getAllPosts = async (req, res, next) => {
    new OK({
      message: 'Get All Posts Successfully',
      metadata: await AdminService.getAllPosts({
        page: req.params.page,
        limit: req.params.pagesize
      })
    }).send(res);
  };
  /* 
        Find User By Id
        Link: http://localhost:4052/api/v1/admin/users/find/:user_id
    */
  static findUserById = async (req, res, next) => {
    new OK({
      message: 'Find User By Id Successfully',
      metadata: await AdminService.findUserById({
        user_id: req.params.user_id
      })
    }).send(res);
  };
  /* 
        Update User
        Link: http://localhost:4052/api/v1/admin/users/update/:user_id
    */
  static updateUser = async (req, res, next) => {
    new OK({
      message: 'Update User Successfully',
      metadata: await AdminService.updateUser({
        user_id: req.params.user_id,
        payload: { ...req.body }
      })
    }).send(res);
  };
  /* 
        Get All User
        Link: http://localhost:4052/api/v1/admin/users
    */
  static getAllUsers = async (req, res, next) => {
    new OK({
      message: 'Get All Users Successfully',
      metadata: await AdminService.getAllUsers({
        page: req.params.page,
        limit: req.params.pagesize
      })
    }).send(res);
  };
  /* 
    Delete User
    Link: http://localhost:4052/api/v1/admin/users/delete/:user_id
  */
  static deleteUser = async (req, res, next) => {
    new OK({
      message: 'Delete User Successfully',
      metadata: await AdminService.deleteUser({
        user_id: req.params.user_id
      })
    }).send(res);
  };
}

export default AdminController;
