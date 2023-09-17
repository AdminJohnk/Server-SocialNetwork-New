const redis = require('redis');

const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;

const objectConnectRedis = {
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT
  }
};

const redisClient = redis.createClient(objectConnectRedis);

class Redis {
  constructor() {
    this.connect();
  }
  async connect() {
    redisClient.on('connect', () => {
      console.log(`Redis connected`);
    });

    redisClient.on('error', () => {
      console.log(`Redis connect failed`);
    });

    await redisClient.connect().catch(err => console.log(err));
  }

  static getInstance() {
    if (!Redis.instance) {
      Redis.instance = new Redis();
    }
    return Redis.instance;
  }
}

const instanceRedis = Redis.getInstance();
module.exports = {
  instanceRedis,
  redisClient,
  objectConnectRedis
};
