'use strict';

const amqp = require('amqplib');

async function consumerOrderedMessage() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const queueName = 'ordered-queued-message';
  await channel.assertQueue(queueName, {
    durable: true
  });

  // Set prefetch để chỉ cho phép consumer nhận 1 message mỗi lần
  // Nếu không set prefetch thì consumer sẽ nhận tất cả các message trong queue
  // Điều này sẽ làm cho việc xử lý message không theo thứ tự
  channel.prefetch(1);

  channel.consume(queueName, msg => {
    const message = msg.content.toString();
    setTimeout(() => {
      console.log('processed:', message);
      channel.ack(msg);
    }, Math.random() * 1000);
  });
}

consumerOrderedMessage().catch(err => console.error(err));
