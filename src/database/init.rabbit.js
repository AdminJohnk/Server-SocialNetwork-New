'use strict';

const amqp = require('amqplib');
const { RABBITMQ_HOST, RABBITMQ_PORT } = process.env;

const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(`amqp://localhost`);
    if (!connection) throw new Error('Connection RabbitMQ not established');

    const channel = await connection.createChannel();

    return { channel, connection };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const closeConnection = connection => {
  try {
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.log('Error closing RabbitMQ connection', error);
    throw error;
  }
};

module.exports = {
  connectToRabbitMQ,
  closeConnection
};
