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
  createKeyToken: async function ({
    userId,
    publicKey,
    privateKey,
    refreshToken
  }) {
    try {
      // level 0
      // const tokens = await this.create({
      //   user: userId.toString(),
      //   publicKey,
      //   privateKey
      // });
      // return tokens || null;

      // level xxx
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
    } catch (error) {
      console.log('error: ', error.message);
      return error;
    }
  }
};

module.exports = model(DOCUMENT_NAME, KeyTokenSchema);
