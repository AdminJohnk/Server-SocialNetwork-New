'use strict';

const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../core/error.response');
const { getInfoData, limitData } = require('../utils/functions');
const axios = require('axios');
const { UserClass } = require('../models/user.model');
const { FollowClass } = require('../models/follow.model');
const { PostClass } = require('../models/post.model');
const { LikeClass } = require('../models/like.model');
const PublisherService = require('./publisher.service');
const NotificationService = require('./notification.service');
const { Notification } = require('../utils/notificationType');
const { LIKEPOST_001, FOLLOWUSER_001 } = Notification;

class UserService {
  static deleteUser = async ({ user_id }) => {
    return await UserClass.deleteUser({
      user_id
    });
  };
  static getMyInfo = async ({ user_id }) => {
    return await UserClass.getMyInfo({
      user_id
    });
  };
  static savePost = async ({ user, post }) => {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    const { numSave } = await UserClass.savePost({
      user,
      post
    });

    PostClass.changeNumberPost({
      post_id: post,
      type: 'save',
      number: numSave
    });

    PostClass.changeBehaviorPost({
      post_id: post,
      type: 'save',
      user_id: user,
      number: numSave
    });

    return true;
  };
  static likePost = async ({ user, post, owner_post }) => {
    const foundPost = await PostClass.checkExist({
      _id: post,
      'post_attributes.user': owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    const { numLike } = await LikeClass.likePost({
      user,
      post,
      owner_post
    });

    PostClass.changeNumberPost({
      post_id: post,
      type: 'like',
      number: numLike
    });

    PostClass.changeBehaviorPost({
      post_id: post,
      type: 'like',
      user_id: user,
      number: numLike
    });

    if (user !== owner_post && numLike === 1) {
      const msg = NotificationService.createMsgToPublish({
        type: LIKEPOST_001,
        sender: user,
        receiver: owner_post,
        post: post
      });

      PublisherService.publishNotify(msg);
    }

    return true;
  };
  static updateTags = async ({ user_id, tags }) => {
    return await UserClass.updateTags({
      user_id,
      tags
    });
  };
  static getRepositoryGithub = async ({ access_token_github }) => {
    const { data: result } = await axios.get(
      'https://api.github.com/user/repos',
      {
        headers: {
          Authorization: `Bearer ${access_token_github}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );
    if (!result) throw new BadRequestError('Cannot get repository github');

    const repos = await Promise.all(
      result.map(async repository => {
        const { data } = await axios.get(repository.languages_url, {
          headers: {
            Authorization: `Bearer ${access_token_github}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });

        const result = getInfoData({
          fields: [
            'id',
            'name',
            'private',
            'html_url',
            'watchers_count',
            'forks_count',
            'stargazers_count'
          ],
          object: repository
        });

        result.languages = Object.keys(data)[0];

        return result;
      })
    );
    return limitData({ data: repos, limit: 1000, page: 1 });
  };
  static async followUser({ me_id, user }) {
    const foundUser = await UserClass.checkExist({ _id: user });
    if (!foundUser) throw new NotFoundError('User not found');

    const { numFollow } = await FollowClass.followUser({ me_id, user });

    UserClass.changeNumberUser({
      user_id: me_id,
      type: 'following',
      number: numFollow
    }).catch(err => console.log(err));

    UserClass.changeNumberUser({
      user_id: user,
      type: 'follower',
      number: numFollow
    }).catch(err => console.log(err));

    if (me_id !== user && numFollow === 1) {
      const msg = NotificationService.createMsgToPublish({
        type: FOLLOWUSER_001,
        sender: me_id,
        receiver: user
      });

      PublisherService.publishNotify(msg);
    }
    return true;
  }
  static async getListFollowersByUserId({
    user,
    limit = 30,
    page = 1,
    sort = { createdAt: -1 }
  }) {
    const foundUser = await UserClass.checkExist({ _id: user });
    if (!foundUser) throw new NotFoundError('User not found');
    const skip = (page - 1) * limit;
    return await FollowClass.getListFollowersByUserId({
      user,
      limit,
      skip,
      sort
    });
  }
  static async getListFollowingByUserId({
    user,
    limit = 30,
    page = 1,
    sort = { createdAt: -1 }
  }) {
    const foundUser = await UserClass.checkExist({ _id: user });
    if (!foundUser) throw new NotFoundError('User not found');
    const skip = (page - 1) * limit;
    return await FollowClass.getListFollowingByUserId({
      user,
      limit,
      skip,
      sort
    });
  }
  static getShouldFollow = async ({ user_id }) => {
    return await UserClass.getShouldFollow({
      user_id
    });
  };
  static findUserById = async ({ user_id, me_id }) => {
    return await UserClass.findById({
      user_id,
      me_id
    });
  };
  static updateUserById = async ({ user_id, payload }) => {
    return await UserClass.updateByID({
      user_id,
      payload
    });
  };
}

module.exports = UserService;
