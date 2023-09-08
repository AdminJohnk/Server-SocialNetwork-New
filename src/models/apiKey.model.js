'use strict';

// key !dmbg install by Mongo Snippets for Node-js
const { model, Schema } = require('mongoose');
const DOCUMENT_NAME = 'Apikey';
const COLLECTION_NAME = 'apikeys';

// Declare the Schema of the Mongo model
const ApiKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: Boolean,
      default: true
    },
    permissions: {
      type: [String],
      required: true,
      enum: ['0000', '1111', '2222']
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const ApiKeyModel = model(DOCUMENT_NAME, ApiKeySchema);

class ApiKeyClass {
  static async findByID(key) {
    const objKey = await ApiKeyModel.findOne({ key, status: true }).lean();
    return objKey;
  }
}
module.exports = {
  ApiKeyModel,
  ApiKeyClass
}
