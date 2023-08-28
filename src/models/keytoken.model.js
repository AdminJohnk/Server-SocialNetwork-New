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
    // Những RefreshToken đã sử dụng
    refreshTokensUsed: {
      type: Array,
      default: []
    },
    // RefreshToken đang sử dụng
    refreshToken: {
      type: String,
      require: true
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

KeyTokenSchema.statics = {
  findByUserId: async function (userId) {
    return await this.findOne({ user: userId }).lean();
  },
  removeKeyByID: async function (KeyId) {
    return await this.findByIdAndDelete(KeyId);
  },
  createKeyToken: async function ({
    userId,
    publicKey,
    privateKey,
    refreshToken
  }) {
    const filter = { user: userId };
    const update = {
      publicKey,
      privateKey,
      refreshTokensUsed: [],
      refreshToken
    };
    const options = { upsert: true, new: true };

    const tokens = await this.findOneAndUpdate(filter, update, options);
    return tokens || null;
  }
};

module.exports = model(DOCUMENT_NAME, KeyTokenSchema);
