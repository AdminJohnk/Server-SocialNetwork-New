'use strict';

const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../core/error.response');
const { NotiModel } = require('../models/notification.model');

class NotiService {
  static listNotiByUser = async ({ userId = 1, type = 'ALL', isRead = 0 }) => {
    const match = { receiver: userId };
    if (type !== 'ALL') {
      match['type'] = type;
    }
    return await NotiModel.aggregate([
      {
        $match: match
      },
      {
        $project: {
          type: 1,
          sender: 1,
          receiver: 1,
          content: 1,
          options: 1,
          createAt: 1
        }
      }
    ]);
  };
  static pushNotiToSystem = async ({
    type = 'LIKE-001',
    receiver = 1,
    sender = 1,
    options = {}
  }) => {
    let noti_content;

    if (type === 'LIKE-001') {
      noti_content = `@@@ vừa mới có một lượt thích từ @@@@`;
    } else if (type === 'SHARE-001') {
      noti_content = `@@@ vừa mới có một lượt chia sẻ từ @@@@`;
    }
    return await NotiModel.create({
      type,
      content: noti_content,
      sender,
      receiver,
      options
    });
  };
}

module.exports = NotiService;
