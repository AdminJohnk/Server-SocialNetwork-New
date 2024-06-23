'use strict';

import NotiService from '../services/notification.service.js';
import { OK, CREATED } from '../core/success.response.js';

class NotiController {
  static deleteNotification = async (req, res, next) => {
    new OK({
      message: 'Delete Notification Successfully',
      metadata: await NotiService.deleteNotification({
        notify_id: req.params.notify_id,
        user_id: req.user.userId
      })
    }).send(res);
  }
  static markAllAsRead = async (req, res, next) => {
    new OK({
      message: 'Mark All Notifications as Read Successfully',
      metadata: await NotiService.markAllAsRead({
        user_id: req.user.userId
      })
    }).send(res);
  }
  static setSubUnread = async (req, res, next) => {
    new OK({
      message: 'Set Sub Unread Notifications Successfully',
      metadata: await NotiService.setSubUnread({
        user_id: req.user.userId
      })
    }).send(res);
  }
  static markAsRead = async (req, res, next) => {
    new OK({
      message: 'Mark Notification as Read Successfully',
      metadata: await NotiService.markAsRead({
        notify_id: req.params.notify_id
      })
    }).send(res);
  }
  static getUnreadNotiNumber = async (req, res, next) => {
    new OK({
      message: 'Get Unread Notifications Number Successfully',
      metadata: await NotiService.getUnreadNotiNumber({
        user_id: req.user.userId
      })
    }).send(res);
  }
  static readAllNotifications = async (req, res, next) => {
    new OK({
      message: 'Read All Notifications Successfully',
      metadata: await NotiService.readAllNotifications({
        user_id: req.user.userId
      })
    }).send(res);
  }
  static getAllNotifications = async (req, res, next) => {
    new OK({
      message: 'Get All Notifications Successfully',
      metadata: await NotiService.getAllNotifications({
        user_id: req.user.userId,
        page: req.query.page
      })
    }).send(res);
  }
}

export default NotiController;
