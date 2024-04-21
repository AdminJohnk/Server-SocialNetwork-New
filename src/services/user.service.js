'use strict';

import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../core/error.response.js';
import { getInfoData, limitData } from '../utils/functions.js';
import axios from 'axios';
import { UserClass } from '../models/user.model.js';
import { PostClass } from '../models/post.model.js';
import { LikeClass } from '../models/like.model.js';
import { FriendClass } from '../models/friend.model.js';
import PublisherService from './publisher.service.js';
import NotificationService from './notification.service.js';
import { Notification } from '../utils/notificationType.js';
const { LIKEPOST_001, SENDFRIENDREQUEST_001, ACCEPTFRIENDREQUEST_001 } = Notification;

class UserService {
  static checkExistEmail = async ({ email }) => {
    const check = await UserClass.checkExist({
      email
    });
    return check ? true : false;
  };
  static deleteUser = async ({ user_id }) => {
    return await UserClass.deleteUser({
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

    await PostClass.changeToArrayPost({
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

    await PostClass.changeToArrayPost({
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
  static getRepositoryGithub = async ({ access_token_github }) => {
    const { data: result } = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${access_token_github}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    if (!result) throw new BadRequestError('Cannot get repository github');

    const repos = await Promise.all(
      result.map(async (repository) => {
        const { data } = await axios.get(repository.languages_url, {
          headers: {
            Authorization: `Bearer ${access_token_github}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });

        const result = getInfoData({
          fields: ['id', 'name', 'private', 'html_url', 'watchers_count', 'forks_count', 'stargazers_count'],
          object: repository
        });

        result.languages = Object.keys(data)[0];

        return result;
      })
    );
    return limitData({ data: repos, limit: 1000, page: 1 });
  };
  static getShouldFollow = async ({ user_id }) => {
    return await UserClass.getShouldFollow({
      user_id
    });
  };
  static getMyInfo = async ({ user_id }) => {
    return await UserClass.getMyInfo({
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
  static sendFriendRequest = async ({ user_id, friend_id }) => {
    const result = await FriendClass.sendFriendRequest({
      user_id,
      friend_id
    });

    if (!result) throw new ConflictRequestError('Friend request already sent');

    const msg = NotificationService.createMsgToPublish({
      type: SENDFRIENDREQUEST_001,
      sender: user_id,
      receiver: friend_id
    });

    PublisherService.publishNotify(msg);

    return result;
  };
  static cancelFriendRequest = async ({ user_id, friend_id }) => {
    const result = await FriendClass.cancelFriendRequest({
      user_id,
      friend_id
    });

    if (!result) throw new NotFoundError('Friend request not found');

    return result;
  };
  static acceptFriendRequest = async ({ user_id, friend_id }) => {
    const result = await FriendClass.acceptFriendRequest({
      user_id,
      friend_id
    });

    if (!result) throw new NotFoundError('Friend request not found');

    const msg = NotificationService.createMsgToPublish({
      type: ACCEPTFRIENDREQUEST_001,
      sender: user_id,
      receiver: friend_id
    });

    PublisherService.publishNotify(msg);

    return result;
  };
  static async deleteFriend({ user_id, friend_id }) {
    const result = await FriendClass.deleteFriend({
      user_id,
      friend_id
    });

    if (!result) throw new NotFoundError('Friend not found');

    return result;
  }
  static async declineFriendRequest({ user_id, friend_id }) {
    const result = await FriendClass.declineFriendRequest({
      user_id,
      friend_id
    });

    if (!result) throw new NotFoundError('Friend request not found');

    return result;
  }
  static findFriend = async ({ user_id, key_search, limit, skip }) => {
    return await FriendClass.findFriend({
      user_id,
      key_search,
      limit,
      skip
    });
  };
  static async getAllFriends({ user_id, me_id }) {
    return await FriendClass.getAllFriends({
      user_id,
      me_id
    });
  }
  static async getRequestsSent({ user_id }) {
    return await FriendClass.getRequestsSent({
      user_id
    });
  }
  static async getRequestsReceived({ user_id }) {
    return await FriendClass.getRequestsReceived({
      user_id
    });
  }
  static async getUsersByName({ search, me_id, page }) {
    return await UserClass.searchUsersByName({
      search,
      me_id,
      page
    });
  }
}

export default UserService;
