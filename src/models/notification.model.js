'use strict';

import { model, Schema, Types } from 'mongoose';
const ObjectId = Types.ObjectId;
import { pp_UserDefault } from '../utils/constants.js';

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'notifications';

import { EnumType } from '../utils/notificationType.js';

const NotificationSchema = new Schema(
  {
    type: { type: String, enum: EnumType, required: true },
    sender: { type: ObjectId, ref: 'User', required: true },
    receiver: { type: ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    is_viewed: { type: Boolean, default: false },
    options: { type: Object, default: {} },
    createAt: { type: Date, default: Date.now }
  },
  {
    collection: COLLECTION_NAME
  }
);

NotificationSchema.index({ createAt: 1 }, { expireAfterSeconds: 86400 * 10 });

const NotiModel = model(DOCUMENT_NAME, NotificationSchema);

class NotiClass {
  static async getNewNotification({ user_id, page, limit, sort }) {
    const skip = (page - 1) * limit;
    return await NotiModel.find({ receiver: user_id, is_viewed: false })
      .sort(sort)
      .populate('sender', pp_UserDefault)
      .populate('receiver', pp_UserDefault)
      .skip(skip)
      .limit(limit)
      .lean();
  }
  static async createNotify(payload) {
    await NotiModel.create(payload);
  }
}

export { NotiModel, NotiClass };
