const redis = require('redis');
const redis_link = process.env.REDIS_LINK_DEV || process.env.REDIS_LINK_PRO;

class RedisInit {
  redisClient;
  static async connect() {
    this.redisClient.on('connect', () => {
      console.log(`Redis connected`);
    });

    this.redisClient.on('error', () => {
      console.log(`Redis connect failed`);
    });

    await this.redisClient.connect();
  }
  static async getInstanceRedis() {
    if (!this.redisClient) {
      this.redisClient = redis.createClient({ url: redis_link });
      await this.connect().catch(err => {
        throw new Error(err);
      });
    }
    return this.redisClient;
  }
}

module.exports = RedisInit
