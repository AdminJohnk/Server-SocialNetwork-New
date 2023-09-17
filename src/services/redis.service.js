const redis = require('redis');
const { objectConnectRedis } = require('../utils/constants');

class RedisService {
  constructor() {
    this.redisClient = redis.createClient(objectConnectRedis);
    this.connect();
  }
  async connect() {
    this.redisClient.on('connect', () => {
      console.log(`Redis connected`);
    });

    this.redisClient.on('error', () => {
      console.log(`Redis connect failed`);
    });

    await this.redisClient.connect();
  }
}

module.exports = new RedisService();
