'use strict';

const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../core/error.response');

const { ImageClass } = require('../models/image.model');
const { deleteImage, sendImageToS3 } = require('../helpers/uploadImage');

class ImageService {
  static deleteImages = async ({ images }) => {
    for (let image of images) {
      const { key, image_id } = image;
      ImageClass.deleteImageById({ image_id });
      deleteImage(key); //S3
    }
    return true;
  };
  static uploadImages = async ({ images, user }) => {
    const metadata = [];
    for (let image of images) {
      const { key, location } = image;

      const newImage = await ImageClass.createImage({
        key,
        link: location,
        user
      });
      metadata.push(newImage);
    }
    return metadata;
  };
  static uploadImage = async ({ image, user }) => {

    const { key, location } = image;
    return await ImageClass.createImage({
      key,
      link: location,
      user
    });
  };
  static checkExist = async (select) => {
    return await ImageClass.findOne(select).lean();
  };
}

module.exports = ImageService;
