'use strict';

const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../core/error.response');
const { NotiClass } = require('../models/notification.model');

class NotiService {
  static pushNotiToSystem = async ({
    type = 'LIKE-001',
    receivedId = 1,
    senderId = 1,
    options = {}
  }) => {
    let noti_content;

    if (type === 'LIKE-001') {
      noti_content = `Bạn vừa mới có một lượt thích từ ${options.sender_name}`;
    } else if (type === 'SHARE-001') {
      noti_content = `Bạn vừa mới có một lượt chia sẻ từ ${options.sender_name}`;
    }

    const newNoti = await NotiClass.create({
      type,
      content: noti_content,
      sender: senderId,
      receiver: receivedId,
      options
    });

    return newNoti;
  };
}

module.exports = NotiService;
