const redispubsubService = require('./redisPubSub.service');

class InventoryServiceTest {
  constructor() {
    redispubsubService.subscribe({
      channel: 'purchase_events',
      callback: (message) => {
        InventoryServiceTest.updateInventory(message);
      }
    });
  }
  updateInventory(message) {
    console.log(
      `Updated inventory ${message.productId} with quantity ${message.quantity}`
    );
  }
}

module.exports = new InventoryServiceTest();
