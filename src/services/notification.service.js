'use strict';

import { NotiClass } from '../models/notification.model.js';
import { UserClass } from '../models/user.model.js';

class NotificationService {
  static async setSubUnread({ user_id }) {
    return await UserClass.setSubUnread({ user_id });
  }
  static async markAsRead({ notify_id }) {
    return await NotiClass.markAsRead({ notify_id });
  }
  static async getUnreadNotiNumber({ user_id }) {
    return await UserClass.getUnreadNotiNumber({ user_id });
  }
  static async readAllNotifications({ user_id }) {
    UserClass.readAllNotifications({ user_id });
  }
  static async getAllNotifications({ user_id, page, limit = 10 }) {
    const skip = (page - 1) * limit;
    return await NotiClass.getAllNotifications({ user_id, skip, limit });
  }
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

export default NotificationService;
