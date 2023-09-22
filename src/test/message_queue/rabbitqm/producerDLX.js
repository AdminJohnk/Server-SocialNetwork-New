const amqp = require('amqplib');

const log = console.log;
console.log = function () {
  log.apply(console, [new Date().toISOString()].concat(arguments));
};

const runProducer = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const notificationExchange = 'notificationEx'; // notificationEx direct
    const notiQueue = 'notificationQueueProcess'; // assertQueue

    const notificationExchangeDLX = 'notificationExDLX'; // notificationEx direct
    const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'; // Dùng khi khai báo queue

    // 1. create Exchange
    await channel.assertExchange(notificationExchange, 'direct', {
      durable: true
    });

    // 2. create Queue
    // Lỗi ở NotiQueue --> chuyển đến queue liên kết với Exchange DLX và RoutingKey DLX
    const queueResult = await channel.assertQueue(notiQueue, {
      exclusive: false, // cho phép các kết nối khác truy cập đến cùng một hàng đợi
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX
    });

    // 3. bindQueue
    await channel.bindQueue(queueResult.queue, notificationExchange);

    // 4. Send message
    const msg = 'Create a new product';
    console.log('producder msg::', msg);
    await channel.sendToQueue(queueResult.queue, Buffer.from(msg), {
      expiration: '10000'
    });

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error('erro::', error);
  }
};

runProducer()
  .then(console.log('RunProducer Successfully'))
  .catch(err => console.error('RunProducer Error::', err));
