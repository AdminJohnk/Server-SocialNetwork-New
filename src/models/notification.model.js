'use strict';

const { model, Schema, Types } = require('mongoose');
const ObjectId = Types.ObjectId;
const { pp_UserDefault } = require('../utils/constants');

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'notifications';

const { EnumType } = require('../utils/notificationType');

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

module.exports = {
  NotiModel,
  NotiClass
};
