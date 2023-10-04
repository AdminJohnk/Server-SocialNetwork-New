const { connectToRabbitMQ } = require('../database/init.rabbit');

class PublisherService {
  static async publishNotify(message) {
    try {
      const { channel, connection } = await connectToRabbitMQ();

      const notificationExchange = 'notificationEx';
      const notiQueue = 'notificationQueueProcess';

      const notificationExchangeDLX = 'notificationExDLX';
      const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX';

      // 1. create Exchange
      await channel.assertExchange(notificationExchange, 'direct', {
        durable: true
      });

      // 2. create Queue
      // Lỗi ở NotiQueue --> chuyển đến queue liên kết với Exchange DLX và RoutingKey DLX
      const queueResult = await channel.assertQueue(notiQueue, {
        exclusive: false, // cho phép các kết nối khác truy cập đến cùng một hàng đợi
        durable: true,
        deadLetterExchange: notificationExchangeDLX,
        deadLetterRoutingKey: notificationRoutingKeyDLX
      });

      // 3. bindQueue
      await channel.bindQueue(queueResult.queue, notificationExchange);

      // 4. send message
      await channel.sendToQueue(
        queueResult.queue,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          expiration: '10000'
        }
      );

      setTimeout(() => {
        connection.close();
      }, 1000);
    } catch (error) {
      console.error('erro::', error);
    }
  }
}


module.exports = PublisherService;