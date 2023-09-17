const redis = require('redis');
const { objectConnectRedis } = require('../utils/constants');

class RedisPubSubService {
  constructor() {
    const client = redis.createClient(objectConnectRedis);
    this.subscriber = client.duplicate();
    this.publisher = client.duplicate();
    this.connect();
  }
  async connect() {
    this.subscriber.on('connect', () => {
      console.log(`Redis subscriber connected`);
    });

    this.subscriber.on('error', () => {
      console.log(`Redis subscriber connect failed`);
    });
    await this.subscriber.connect();

    // ========================================

    this.publisher.on('connect', () => {
      console.log(`Redis publisher connected`);
    });
    this.publisher.on('error', () => {
      console.log(`Redis publisher connect failed`);
    });
    await this.publisher.connect();
  }
  async publish(channel, message) {
    await this.publisher.publish(channel, message);
  }
  async subscribe({ channel, callback }) {
    await this.subscriber.subscribe(channel, (message, subscribeChannel) => {
      callback(subscribeChannel, message);
    });
  }
}

module.exports = new RedisPubSubService();
