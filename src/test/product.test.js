const RedisPubSubService = require('./redisPubSub.service');

class ProductServiceTest {
  static async purchaseProduct(product, quantity) {
    const order = {
      product,
      quantity
    };
    RedisPubSubService.publish('purchase_events', JSON.stringify(order));
  }
}

module.exports = ProductServiceTest;