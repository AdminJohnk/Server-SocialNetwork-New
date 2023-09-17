const redis = require('redis');
const { objectConnectRedis } = require('../redis/init.redis');

class TranChiKienClass {
  constructor() {
    this.subscriber = redis.createClient(objectConnectRedis);
    this.publisher = redis.createClient(objectConnectRedis);
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

    // =======================

    this.publisher.on('connect', () => {
      console.log(`Redis publisher connected`);
    });
    this.publisher.on('error', () => {
      console.log(`Redis publisher connect failed`);
    });
    await this.publisher.connect();

    console.log(`Done connect`);
  }

  //   async subscribe({ channel, callback }) {
  //     await this.subscriber.subscribe(channel);
  //     this.subscriber.on('message', (channel, message) => {
  //       callback(message);
  //     });
  //   }

  //   async publish(channel, message) {
  //     await this.publisher.publish(channel, message, (err, reply) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(reply);
  //       }
  //     });
  //   }
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
  async subscribe({ channel, callback }) {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (subscriberChannel, message) => {
      if (channel === subscriberChannel) {
        callback(channel, message);
      }
    });
  }
}

module.exports = new TranChiKienClass();
