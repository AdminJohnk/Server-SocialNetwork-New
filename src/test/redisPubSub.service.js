const redis = require('redis');
const { objectConnectRedis } = require('../redis/init.redis');
const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../core/error.response');

class RedisPubSubService {
  constructor() {
    this.subscriber = redis.createClient(objectConnectRedis);
    this.subscriber.connect();
    this.subscriber.on('connect', () => {
      console.log(`Redis subscriber connected`);
    });

    this.subscriber.on('error', () => {
      console.log(`Redis publisher connect failed`);
    });

    this.publisher = redis.createClient(objectConnectRedis);
    this.publisher.connect();
    this.publisher.on('connect', () => {
      console.log(`Redis publisher connected`);
    });
    this.publisher.on('error', () => {
      console.log(`Redis publisher connect failed`);
    });
  }

  async connect() {
    this.subscriber = redis.createClient(objectConnectRedis);
    await this.subscriber.connect();
    this.subscriber.on('connect', () => {
      console.log(`Redis subscriber connected`);
    });

    this.subscriber.on('error', () => {
      console.log(`Redis publisher connect failed`);
    });

    this.publisher = redis.createClient(objectConnectRedis);
    await this.publisher.connect();
    this.publisher.on('connect', () => {
      console.log(`Redis publisher connected`);
    });
    this.publisher.on('error', () => {
      console.log(`Redis publisher connect failed`);
    });
  }

  publish(channel, message) {
    return new Promise((resolve, reject) => {
      this.publisher.publish(channel, message, (err, reply) => {
        console.log('Co publish do nhe');
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async publish(channel, message) {
    // await this.publisher.publish(channel, message, (err, reply) => {
    //   if (err) throw new BadRequestError('Publish failed');
    //   return reply;
    // });
  }

  async subscribe({ channel, callback }) {
    await this.subscriber.subscribe(channel, (err, reply) => {
      if (err) throw new BadRequestError('Subscribe failed');
      else {
        console.log('Subscribe success');
      }
    });
    this.subscriber.on('message', (subscriberChannel, message) => {
      if (channel === subscriberChannel) {
        callback(message);
      }
    });
  }

  subcribe({ channel, callback }) {
    this.subscriber.subscribe(channel);
    this.subscriber.on('message', (subscriberChannel, message) => {
      if (channel === subscriberChannel) {
        callback(channel, message);
      }
    });
  }
}

module.exports = new RedisPubSubService();
