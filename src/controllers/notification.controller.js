'use strict';

import NotiService from '../services/notification.service.js';
import { OK, CREATED } from '../core/success.response.js';
import { HEADER } from '../utils/constants.js';

class NotiController {
  static getNewNotification = async (req, res, next) => {
    new OK({
      message: 'Get New Notification Successfully',
      metadata: await NotiService.getNewNotification({
        id_incr: req.params.id_incr,
        user_id: req.user.userId
      })
    }).send(res);
  };
}

export default NotiController;
