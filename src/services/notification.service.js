const { connectToRabbitMQ } = require('../database/init.rabbit');
const { UserIncrClass } = require('../models/user_incr.model');
const { NotiClass } = require('../models/notification.model');

class NotificationService {
  static getNewNotification = async ({
    user_id,
    id_incr,
    page = 1,
    limit = 10,
    sort = { createAt: -1 }
  }) => {
    await this.getNewNotificationFromMQ({ user_id, id_incr });
    return await NotiClass.getNewNotification({
      user_id,
      page,
      limit,
      sort
    });
  };
  static getNewNotificationFromMQ = async ({ user_id, id_incr }) => {
    const { channel, connection } = await connectToRabbitMQ();

    const userIncr = await UserIncrClass.getIdCurrent();
    const numQueue = Math.ceil(userIncr.id_current / 1000);

    const queueNumber = Math.ceil(id_incr / 1000);
    let queueName = `notificationQueue${queueNumber}`;
    if (queueNumber > numQueue) queueName = notiQueueCommon;

    const checkQueue = await channel.checkQueue(queueName);
    const msgNumber = checkQueue.messageCount;

    await channel.prefetch(msgNumber);

    await channel.consume(
      queueName,
      async msg => {
        const message = JSON.parse(msg.content.toString());
        if (message.receiver === user_id) {
        // if (message.receiver === user_id && message.id_incr === id_incr) {
        // if (
        //   message.id_incr === 5 ||
        //   message.id_incr === 6 ||
        //   message.id_incr === 9
        // ) {
          await NotiClass.createNotify(message);
          console.log('message: ', message);
          channel.cancel(queueName);
          channel.ack(msg);
        } else {
          channel.cancel(queueName);
          channel.nack(msg, false, true);
        }
      },
      {
        consumerTag: queueName
      }
    );

    setTimeout(() => {
      connection.close();
    }, 500);
  };
  static createMsgToPublish = ({ type, sender, receiver, ...options }) => {
    return {
      ...type,
      sender,
      receiver,
      createAt: new Date().toISOString(),
      options
    };
  };
}

module.exports = NotificationService;
