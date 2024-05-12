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
  static updatePost = async ({
    series_id,
    id,
    user,
    title,
    description,
    content,
    cover_image,
    visibility,
    read_time
  }) => {
    const series = await SeriesClass.getSeriesById({ series_id, user });
    if (!series) throw new NotFoundError('Series not found');

    const post = series.posts.find((post) => post._id == id);
    if (!post) throw new NotFoundError('Post not found');

    if (!title) throw new BadRequestError('Title is required');
    if (!description) throw new BadRequestError('Description is required');
    if (!content) throw new BadRequestError('Content is required');
    if (!cover_image) throw new BadRequestError('Images is required');
    if (!visibility) throw new BadRequestError('Visibility is required');
    if (!read_time) throw new BadRequestError('Read time is required');

    const updatedPost = await SeriesClass.updatePost({
      series_id,
      id,
      title,
      description,
      content,
      cover_image,
      visibility,
      read_time
    });
    return updatedPost;
  };
  static createPost = async ({
    user,
    series_id,
    title,
    description,
    content,
    cover_image,
    visibility,
    read_time
  }) => {
    const series = await SeriesClass.getSeriesById({ series_id, user });
    if (!series) throw new NotFoundError('Series not found');

    if (!title) throw new BadRequestError('Title is required');
    if (!description) throw new BadRequestError('Description is required');
    if (!content) throw new BadRequestError('Content is required');
    if (!cover_image) throw new BadRequestError('Images is required');
    if (!visibility) throw new BadRequestError('Visibility is required');
    if (!read_time) throw new BadRequestError('Read time is required');

    const post = await SeriesClass.createPost({
      user,
      series_id,
      title,
      description,
      content,
      cover_image,
      visibility,
      read_time
    });
    return post;
  };

  static updateSeries = async ({
    series_id,
    user,
    title,
    description,
    introduction,
    level,
    cover_image,
    visibility
  }) => {
    const series = await SeriesClass.getSeriesById({ series_id, user });
    if (!series) throw new NotFoundError('Series not found');

    if (!title) throw new BadRequestError('Title is required');
    if (!description) throw new BadRequestError('Description is required');
    if (!introduction) throw new BadRequestError('Introduction is required');
    if (!level) throw new BadRequestError('Level is required');
    if (!cover_image) throw new BadRequestError('Images is required');
    if (!visibility) throw new BadRequestError('Visibility is required');

    const updatedSeries = await SeriesClass.updateSeries({
      series_id,
      user,
      title,
      description,
      introduction,
      level,
      cover_image,
      visibility
    });
  };
  static getSeriesById = async ({ series_id }) => {
    const series = await SeriesClass.getSeriesById({ series_id });
    if (!series) throw new NotFoundError('Series not found');
    return series;
  };
  static getAllSeries = async ({
    user,
    page,
    me_id,
    limit = 10,
    sort = { createdAt: -1 }
  }) => {
    const skip = (parseInt(page) - 1) * limit;

    const series = await SeriesClass.getAllSeries({ user, limit, skip, sort,me_id });
    return series;
  };
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
