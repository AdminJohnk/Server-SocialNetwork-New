'use strict';

const NotiService = require('../services/notification.service');
const { OK, CREATED } = require('../core/success.response');
const { HEADER } = require('../utils/constants');

class NotiController {
  static listNotiByUser = async (req, res, next) => {
    new OK({
      message: 'List Notification Successfully',
      metadata: await NotiService.listNotiByUser({
        userId: 1
      })
    }).send(res);
  };
}

module.exports = NotiController;
