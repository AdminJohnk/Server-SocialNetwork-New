'use strict';

import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../../core/error.response.js';
import { UserClass } from '../../models/user.model.js';

class UserRedisService {
  static async delAll({ user_id }) {
    const key = `user/:${user_id}/*`;
    const keys = await __redisClient.KEYS(key);
    for (const key of keys) {
      await __redisClient.DEL(key);
    }
  }
  static async getMyInfo({ user_id, type }) {
    const key = `user/:${user_id}/getMyInfo`;

    if (type === 'get') return await __redisClient.GET(key);
    if (type === 'set') {
      const value = await UserClass.getMyInfo({
        user_id
      });
      await __redisClient.SET(key, JSON.stringify(value));
    }
  }
  static async findUserById({ user_id, me_id, value, type }) {
    const key = `user/:${user_id}/findUserById/:${me_id}`;

    if (type === 'get') return await __redisClient.GET(key);
    if (type === 'set') {
      await __redisClient.SET(key, JSON.stringify(value));
    }
  }
}

export default UserRedisService;
