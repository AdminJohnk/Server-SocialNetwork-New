'use strict';

const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../../core/error.response');
const { PostClass } = require('../../models/post.model');

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

module.exports = PostRedisService;
