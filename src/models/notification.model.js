'use strict';

import { model, Schema, Types } from 'mongoose';
import { NotiEnumMongoose } from '../utils/notificationType.js';
import { pp_UserDefault } from '../utils/constants.js';
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'notifications';

const NotificationSchema = new Schema(
  {
    type: { type: String, enum: NotiEnumMongoose, required: true },
    sender: { type: ObjectId, ref: 'User', required: true },
    receiver: { type: ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    is_pushed: { type: Boolean, default: false },
    options: {
      type: {
        post: { type: ObjectId, ref: 'Post' },
        friend: { type: ObjectId, ref: 'User' }
      },
      default: {}
    },
    createAt: { type: Date, default: Date.now }
  },
  {
    collection: COLLECTION_NAME
  }
);

NotificationSchema.index({ createAt: 1 }, { expireAfterSeconds: 86400 * 10 });

const NotiModel = model(DOCUMENT_NAME, NotificationSchema);

class NotiClass {
  static async deleteNotification({ notify_id }) {
    await NotiModel.deleteOne({ _id: notify_id });
  }
  static async markAllAsRead({ user_id }) {
    await NotiModel.updateMany({ receiver: user_id }, { is_read: true });
  }
  static async markAsRead({ notify_id }) {
    await NotiModel.updateOne({ _id: notify_id }, { is_read: true });
  }
  static async getAllNotifications({ user_id, skip, limit }) {
    return await NotiModel.find({ receiver: user_id })
      .populate('sender', pp_UserDefault)
      .sort({ createAt: -1 })
      .skip(skip)
      .limit(limit);
  }
  static async createNotify(payload) {
    await NotiModel.create(payload);
  }
  static async checkExist({ notify_id }) {
    return await NotiModel.findOne({ _id: notify_id });
  }
}

export { NotiModel, NotiClass };
