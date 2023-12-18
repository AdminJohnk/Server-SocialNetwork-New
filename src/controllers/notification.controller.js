'use strict';

const NotiService = require('../services/notification.service');
const { OK, CREATED } = require('../core/success.response');
const { HEADER } = require('../utils/constants');

class NotiController {
  static getNewNotification = async (req, res, next) => {
    console.log('req.body', req.body);
    new OK({
      message: 'Get New Notification Successfully',
      metadata: await NotiService.getNewNotification({
        id_incr: req.params.id_incr,
        user_id: req.user.userId
      })
    }).send(res);
  }
}

module.exports = NotiController;
