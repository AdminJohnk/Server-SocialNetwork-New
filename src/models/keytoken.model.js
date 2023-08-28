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
  findByRefreshTokenUsed: async function (refreshToken) {
    return await this.findOne({ refreshTokensUsed: refreshToken }).lean();
  },
  findByRefreshToken: async function (refreshToken) {
    return await this.findOne({ refreshToken });
  },
  deleteKeyById: async function (userId) {
    return await this.findOneAndDelete({ user: userId });
  },
  findByUserId: async function (userId) {
    return await this.findOne({ user: userId });
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
