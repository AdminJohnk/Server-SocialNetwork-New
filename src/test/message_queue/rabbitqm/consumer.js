const amqp = require('amqplib');

const runConsumer = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    const queueName = 'test_queue';
    await channel.assertQueue(queueName, { durable: true });

    // receive message from producer channel
    await channel.consume(
      queueName,
      message => {
        console.log(`Consumer received message: ${message.content.toString()}`);
      },
      { noAck: true }
    );

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.log(error);
  }
};

runConsumer().catch(console.error);
