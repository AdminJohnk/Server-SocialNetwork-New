'use strict';

import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../core/error.response.js';

import { ImageClass } from '../models/image.model.js';
import { deleteImage } from '../helpers/uploadImage.js';

class ImageService {
  static deleteImages = async ({ images }) => {
    for (let image of images) {
      await deleteImage(image); //S3
    }
    return true;
  };
  static uploadImages = async ({ images, user }) => {
    const metadata = [];
    for (let image of images) {
      const { key } = image;
      metadata.push(key);
    }
    return metadata;
  };
  static uploadImage = async ({ image, user }) => {
    const { key } = image;
    return { key };
  };
}

export default ImageService;
