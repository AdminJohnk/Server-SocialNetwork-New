const amqp = require('amqplib');
const message = 'Hello, RabbitMQ by tran chi kien!';

const runProducer = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    const queueName = 'test_queue';
    await channel.assertQueue(queueName, { durable: true });

    // send message to consumer channel
    channel.sendToQueue(queueName, Buffer.from(message));
    console.log(`Producer send message: ${message}`);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.log(error);
  }
};

runProducer().catch(console.error);
