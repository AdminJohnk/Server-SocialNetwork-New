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
const NotiService = require('./notification.service');

class UserService {
  static getMyInfo = async ({ user_id }) => {
    return await UserClass.getMyInfo({
      user_id
    });
  };
  static savePost = async ({ user, post }) => {
    const foundPost = await PostClass.checkExist({ _id: post });
    if (!foundPost) throw new NotFoundError('Post not found');

    const { share_number } = await UserClass.savePost({
      user,
      post
    });

    PostClass.changeNumberPost({
      post_id: post,
      type: 'save',
      number: share_number
    }).catch(err => console.log(err));

    PostClass.changeBehaviorPost({
      post_id: post,
      type: 'save',
      user_id: user,
      number: share_number
    }).catch(err => console.log(err));

    return true;
  };
  static likePost = async payload => {
    const foundPost = await PostClass.checkExist({
      _id: payload.post,
      'post_attributes.user': payload.owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    const { like_number, result } = await LikeClass.likePost(payload);

    await PostClass.changeNumberPost({
      post_id: payload.post,
      type: 'like',
      number: like_number
    });

    await PostClass.changeBehaviorPost({
      post_id: payload.post,
      type: 'like',
      user_id: payload.user,
      number: like_number
    });

    // NotiService.pushNotiToSystem({
    //   type: 'LIKE-001',
    //   receiver: 1,
    //   sender: payload.user,
    //   options: {
    //     post: 'post_name',
    //     user: payload.user
    //   }
    // })
    //   .then(res => console.log(res))
    //   .catch(err => console.log(err));

    return result;
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
    return await FollowClass.followUser({ me_id, user });
  }
  static async getListFollowersByUserId({
    user,
    limit = 30,
    page = 1,
    sort = 'ctime'
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
    sort = 'ctime'
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
  static findUserById = async ({ user_id }) => {
    return await UserClass.findById({
      user_id
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
