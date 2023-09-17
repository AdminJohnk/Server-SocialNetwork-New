'use strict';

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'notifications';

// LIKE-001: like post success
// SHARE-001: share post success
// COMMENT-001: comment post success
// FOLLOW-001: follow user success

const NotificationSchema = new Schema(
    {
        type: { type: String, enum: ['LIKE-001', 'SHARE-001', 'COMMENT-001', 'FOLLOW-001'], required: true },
        sender: { type: Number, required: true },
        receiver: { type: Number, required: true },
        content: { type: String, required: true },
        options: { type: Object, default: {} }
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME
    }
);

const NotiModel = model(DOCUMENT_NAME, NotificationSchema);

class NotiClass {

}

module.exports = {
    NotiModel,
    NotiClass
}