'use strict';

import { Schema, model, Types } from 'mongoose';

const DOCUMENT_NAME = 'Image';
const COLLECTION_NAME = 'images';

const ImageSchema = new Schema(
  {
    key: { type: String, required: true },
    link: { type: String, required: true },
    user: { type: Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const ImageModel = model(DOCUMENT_NAME, ImageSchema);

class ImageClass {
  static deleteImageById = async ({ image_id }) => {
    return ImageModel.findByIdAndDelete(image_id);
  };
  static createImage = async ({ key, link, user }) => {
    return await ImageModel.create({ key, link, user });
  };
  static async checkExist(select) {
    return await ImageModel.findOne(select).lean();
  }
}

export { ImageModel, ImageClass };
