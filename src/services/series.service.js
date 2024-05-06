'use strict';

import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../core/error.response.js';

import { SeriesClass } from '../models/series.model.js';

class SeriesService {
  static createSeries = async ({
    user,
    title,
    description,
    introduction,
    level,
    cover_image,
    visibility
  }) => {
    if (!title) throw new BadRequestError('Title is required');
    if (!description) throw new BadRequestError('Description is required');
    if (!introduction) throw new BadRequestError('Introduction is required');
    if (!level) throw new BadRequestError('Level is required');
    if (!cover_image) throw new BadRequestError('Images is required');
    if (!visibility) throw new BadRequestError('Visibility is required');

    const series = await SeriesClass.createSeries({
      user,
      title,
      description,
      introduction,
      level,
      cover_image,
      visibility
    });
    return series;
  };

  //   static deleteImages = async ({ images }) => {
  //     for (let image of images) {
  //       await deleteImage(image); //S3
  //     }
  //     return true;
  //   };
  //   static uploadImages = async ({ images, user }) => {
  //     const metadata = [];
  //     for (let image of images) {
  //       const { key } = image;
  //       metadata.push(key);
  //     }
  //     return metadata;
  //   };
  //   static uploadImage = async ({ image, user }) => {
  //     const { key } = image;
  //     return { key };
  //   };
}

export default SeriesService;
