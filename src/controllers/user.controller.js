'use strict';

const UserService = require('../services/user.service');
const { OK, CREATED } = require('../core/success.response');
const { HEADER } = require('../utils/constants');

class UserController {
  /* 
    Delete User
  */
  static deleteUser = async (req, res, next) => {
    new OK({
      message: 'Delete User Successfully',
      metadata: await UserService.deleteUser({
        user_id: req.user.userId
      })
    }).send(res);
  };
  /* 
    Get My Info
    Link: http://localhost:4052/api/v1/users/me
  */
  static getMyInfo = async (req, res, next) => {
    new OK({
      message: 'Get My Info Successfully',
      metadata: await UserService.getMyInfo({
        user_id: req.user.userId
      })
    }).send(res);
  };
  /* 
    Save Post
    Link: http://localhost:4052/api/v1/users/savepost/:post_id
  */
  static savePost = async (req, res, next) => {
    new OK({
      message: 'Save Post Successfully',
      metadata: await UserService.savePost({
        user: req.user.userId,
        post: req.params.post_id
      })
    }).send(res);
  };
  /* 
    Like Post
    Link: http://localhost:4052/api/v1/users/likepost
    {
      "post":"64fcb3b32ca9a1e8f2880ff8",
      "owner_post":"64fc14818dc25f31e5c4f5ac"
    }
  */
  static likePost = async (req, res, next) => {
    new OK({
      message: 'Like Post Successfully',
      metadata: await UserService.likePost({
        user: req.user.userId,
        ...req.body
      })
    }).send(res);
  };
  /* 
    Update Tags
    Link: http://localhost:4052/api/v1/users/tags/:user_id
    [
      "Database", "MongoDB", "NodeJS", "ReactJS", "Data Analyst", "DeOps"
    ]
  */
  static updateTags = async (req, res, next) => {
    new OK({
      message: 'Update Tags Successfully',
      metadata: await UserService.updateTags({
        user_id: req.params.user_id,
        tags: [...req.body]
      })
    }).send(res);
  };
  /* 
    Follow User
    Link: http://localhost:4052/api/v1/users/follow/:user_id
  */
  static followUser = async (req, res, next) => {
    new OK({
      message: 'Follow User Successfully',
      metadata: await UserService.followUser({
        me_id: req.user.userId,
        user: req.params.user_id
      })
    }).send(res);
  };
  /* 
      Get List Followers By User ID
      Link: http://localhost:4052/api/v1/users/followers/:user_id
    */
  static getListFollowersByUserId = async (req, res, next) => {
    new OK({
      message: 'Get List Followers Successfully',
      metadata: await UserService.getListFollowersByUserId({
        user: req.params.user_id
      })
    }).send(res);
  };
  /* 
      Get List Following By User ID
      Link: http://localhost:4052/api/v1/users/following/:user_id
    */
  static getListFollowingByUserId = async (req, res, next) => {
    new OK({
      message: 'Get List Followers Successfully',
      metadata: await UserService.getListFollowingByUserId({
        user: req.params.user_id
      })
    }).send(res);
  };
  /* 
    Get Repository Github
    Link: http://localhost:4052/api/v1/users/repositories
  */
  static getRepositoryGithub = async (req, res, next) => {
    new OK({
      message: 'Get Repository Github Successfully',
      metadata: await UserService.getRepositoryGithub({
        access_token_github: req.headers[HEADER.GITHUB_TOKEN]
      })
    }).send(res);
  };
  static getShouldFollow = async (req, res, next) => {
    new OK({
      message: 'Get Should Follow Successfully',
      metadata: await UserService.getShouldFollow({
        user_id: req.user.userId
      })
    }).send(res);
  };
  /* 
    Find User By ID
    Link: http://localhost:4052/api/v1/users/find/:user_id
  */
  static findUserById = async (req, res, next) => {
    new OK({
      message: 'Get User Successfully',
      metadata: await UserService.findUserById({
        user_id: req.params.user_id,
        me_id: req.user.userId
      })
    }).send(res);
  };
  /* 
    Update User By ID
    Link: http://localhost:4052/api/v1/users/:user_id
    {
      "name":"Trần Chí Kiên",
      "email": "tck22102002h@gmail.com",
      "password": "tck221020021234",
      "experiences": [
          {
              "positionName":"Senior Java",
              "companyName":"FPT"
          }
        ]
    }
  */
  static updateUserById = async (req, res, next) => {
    new OK({
      message: 'Update User Successfully',
      metadata: await UserService.updateUserById({
        user_id: req.user.userId,
        payload: { ...req.body }
      })
    }).send(res);
  };
}

module.exports = UserController;
