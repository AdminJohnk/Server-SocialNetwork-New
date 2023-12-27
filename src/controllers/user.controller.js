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
  /**
   * Send Friend Request
   */
  static sendFriendRequest = async (req, res, next) => {
    new CREATED({
      message: 'Send Friend Request Successfully',
      metadata: await UserService.sendFriendRequest({
        user_id: req.user.userId,
        friend_id: req.params.friend_id
      })
    }).send(res);
  };
  /**
   * Cancel Friend Request
   */
  static cancelFriendRequest = async (req, res, next) => {
    new OK({
      message: 'Cancel Friend Request Successfully',
      metadata: await UserService.cancelFriendRequest({
        user_id: req.user.userId,
        friend_id: req.params.friend_id
      })
    }).send(res);
  };
  /**
   * Accept Friend Request
   */
  static acceptFriendRequest = async (req, res, next) => {
    new OK({
      message: 'Accept Friend Request Successfully',
      metadata: await UserService.acceptFriendRequest({
        user_id: req.user.userId,
        friend_id: req.params.friend_id
      })
    }).send(res);
  };
  /**
   * Decline Friend Request
   */
  static async declineFriendRequest(req, res, next) {
    new OK({
      message: 'Decline Friend Request Successfully',
      metadata: await UserService.declineFriendRequest({
        user_id: req.user.userId,
        friend_id: req.params.friend_id
      })
    }).send(res);
  }
  /**
   * Delete Friend
   */
  static deleteFriend = async (req, res, next) => {
    new OK({
      message: 'Delete Friend Successfully',
      metadata: await UserService.deleteFriend({
        user_id: req.user.userId,
        friend_id: req.params.friend_id
      })
    }).send(res);
  };
  /**
   * Find Friend
   */
  static findFriend = async (req, res, next) => {
    new OK({
      message: 'Find Friend Successfully',
      metadata: await UserService.findFriend({
        user_id: req.user.userId,
        key_search: req.query.key_search,
        page: req.query.page
      })
    }).send(res);
  };
  /**
   * Get Friend List
   */
  static getAllFriends = async (req, res, next) => {
    new OK({
      message: 'Get All Friends Successfully',
      metadata: await UserService.getAllFriends({
        user_id: req.params.userId
      })
    }).send(res);
  };
  /**
   * Get Request Sent
   */
  static getRequestsSent = async (req, res, next) => {
    new OK({
      message: 'Get Request Sent Successfully',
      metadata: await UserService.getRequestsSent({
        user_id: req.user.userId
      })
    }).send(res);
  };

  /**
   * Get Request Received
   */
  static getRequestsReceived = async (req, res, next) => {
    new OK({
      message: 'Get Request Received Successfully',
      metadata: await UserService.getRequestsReceived({
        user_id: req.user.userId
      })
    }).send(res);
  };

  /**
   * Get Users By Name
   */
  static getUsersByName = async (req, res, next) => {
    new OK({
      message: 'Get Users By Name Successfully',
      metadata: await UserService.getUsersByName({
        search: req.query.search,
        page: req.query.page
      })
    }).send(res);
  }
}

module.exports = UserController;
