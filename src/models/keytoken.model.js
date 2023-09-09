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

const KeyTokenModel = model(DOCUMENT_NAME, KeyTokenSchema);

class KeyTokenClass {
  static async findByRefreshTokenUsed(refreshToken) {
    return await KeyTokenModel.findOne({
      refreshTokensUsed: refreshToken
    }).lean();
  }
  static async findByRefreshToken(refreshToken) {
    return KeyTokenModel.findOne({ refreshToken });
  }
  static async deleteKeyById(userId) {
    return await KeyTokenModel.findOneAndDelete({ user: userId });
  }
  static async findByUserId(userId) {
    return await KeyTokenModel.findOne({ user: userId });
  }
  static async removeKeyByID(KeyId) {
    return await KeyTokenModel.findByIdAndDelete(KeyId);
  }
  static async createKeyToken({ userId, publicKey, privateKey, refreshToken }) {
    const filter = { user: userId };
    const update = {
      publicKey,
      privateKey,
      refreshTokensUsed: [],
      refreshToken
    };
    const options = { upsert: true, new: true };

    const tokens = await KeyTokenModel.findOneAndUpdate(filter, update, options);
    return tokens || null;
  }
}

module.exports = {
  KeyTokenModel,
  KeyTokenClass
};
