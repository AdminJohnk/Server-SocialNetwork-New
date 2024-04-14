'use strict';

import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../../core/error.response.js';
import { PostClass } from '../../models/post.model.js';

class PostRedisService {
  static delAll = async ({ post_id }) => {
    const key = `post/:${post_id}/*`;
    const keys = await __redisClient.KEYS(key);
    for (const key of keys) {
      await __redisClient.DEL(key);
    }
  };

  static async getPostById({ post_id, user, scope = 'Normal', value, type }) {
    const key = `post/:${post_id}/getPostById/:${user}/:${scope}`;

    if (type === 'get') return await __redisClient.GET(key);
    if (type === 'set') {
      await __redisClient.SET(key, JSON.stringify(value));
    }
  }
}

export default PostRedisService;
