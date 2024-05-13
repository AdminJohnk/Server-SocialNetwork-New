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
  static deleteSeries = async ({ series_id, user }) => {
    const series = await SeriesClass.checkExist({ _id: series_id, user });
    if (!series) throw new ForbiddenError('Unauthorized to delete this series');

    return await SeriesClass.deleteSeries({ series_id, user });
  };
  static deletePost = async ({ series_id, post_id, user }) => {
    const series = await SeriesClass.checkExist({ _id: series_id, user });
    if (!series) throw new ForbiddenError('Unauthorized to delete this post');

    const post = series.posts.find(post => post._id == post_id);
    if (!post) throw new NotFoundError('Post not found');

    return await SeriesClass.deletePost({ series_id, post_id });
  };

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
    const series = await SeriesClass.checkExist({ _id: series_id, user });
    if (!series) throw new ForbiddenError('Unauthorized to update this post');

    const post = series.posts.find(post => post._id == id);
    if (!post) throw new NotFoundError('Post not found');

    if (!title) throw new BadRequestError('Title is required');
    if (!description) throw new BadRequestError('Description is required');
    if (!content) throw new BadRequestError('Content is required');
    if (!cover_image) throw new BadRequestError('Images is required');
    if (!visibility) throw new BadRequestError('Visibility is required');
    if (!read_time) throw new BadRequestError('Read time is required');

    return await SeriesClass.updatePost({
      series_id,
      id,
      title,
      description,
      content,
      cover_image,
      visibility,
      read_time
    });
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
    const series = await SeriesClass.checkExist({ _id: series_id, user });
    if (!series) throw new ForbiddenError('Unauthorized to create post');

    if (!title) throw new BadRequestError('Title is required');
    if (!description) throw new BadRequestError('Description is required');
    if (!content) throw new BadRequestError('Content is required');
    if (!cover_image) throw new BadRequestError('Images is required');
    if (!visibility) throw new BadRequestError('Visibility is required');
    if (!read_time) throw new BadRequestError('Read time is required');

    return await SeriesClass.createPost({
      user,
      series_id,
      title,
      description,
      content,
      cover_image,
      visibility,
      read_time
    });
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
    const series = await SeriesClass.checkExist({ _id: series_id, user });
    if (!series) throw new ForbiddenError('Unauthorized to update this series');

    if (!title) throw new BadRequestError('Title is required');
    if (!description) throw new BadRequestError('Description is required');
    if (!introduction) throw new BadRequestError('Introduction is required');
    if (!level) throw new BadRequestError('Level is required');
    if (!cover_image) throw new BadRequestError('Images is required');
    if (!visibility) throw new BadRequestError('Visibility is required');

    return await SeriesClass.updateSeries({
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
  static getSeriesById = async ({ series_id, me_id }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const user = series.user.toString();

    return SeriesClass.getSeriesById({ series_id, user, me_id });
  };
  static getAllSeries = async ({
    user,
    page,
    me_id,
    limit = 10,
    sort = { createdAt: -1 }
  }) => {
    const skip = (parseInt(page) - 1) * limit;

    return await SeriesClass.getAllSeries({
      user,
      limit,
      skip,
      sort,
      me_id
    });
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

    return await SeriesClass.createSeries({
      user,
      title,
      description,
      introduction,
      level,
      cover_image,
      visibility
    });
  };
}

export default SeriesService;
