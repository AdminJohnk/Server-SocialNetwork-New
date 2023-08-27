'use strict';

const { Schema, model, Types } = require('mongoose');

const DOCUMENT_NAME = 'Key';
const COLLECTION_NAME = 'keys';

var KeyTokenSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },
    publicKey: {
      type: String,
      required: true
    },
    privateKey: {
      type: String,
      required: true
    },
    refreshToken: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

KeyTokenSchema.statics = {
  createKeyToken: async function ({ userId, publicKey, privateKey }) {
    const tokens = await this.create({
      user: userId.toString(),
      publicKey,
      privateKey
    });
    return tokens || null;
  }
};

module.exports = model(DOCUMENT_NAME, KeyTokenSchema);
