'use strict';

import { BadRequestError, NotFoundError, ForbiddenError } from '../core/error.response.js';
import { redis } from '../database/init.redis.js';

import { SeriesClass } from '../models/series.model.js';
import { UserClass } from '../models/user.model.js';

class SeriesService {
  static increaseView = async ({ series_id, me_id }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const isViewed = await redis.get(`series:${series_id}:user:${me_id}:view`);
    if (isViewed) return true;

    await redis.setex(`series:${series_id}:user:${me_id}:view`, 5 * 60, 1);

    await SeriesClass.increaseView({ series_id });
    return true;
  };
  static savePost = async ({ series_id, post_id, user }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const post = series.posts.find((post) => post._id == post_id);
    if (!post) throw new NotFoundError('Post not found');

    const result = await SeriesClass.savePost({ series_id, post_id, user });
    UserClass.savePostSeries({ user_id: user, series_id, post_id });

    return result;
  };
  static likeReplyComment = async ({ series_id, post_id, comment_id, child_id, user }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const post = series.posts.find((post) => post._id == post_id);
    if (!post) throw new NotFoundError('Post not found');

    const comment = post.comments.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    const reply = comment.child.find((reply) => reply._id == child_id);
    if (!reply) throw new NotFoundError('Reply not found');

    return await SeriesClass.likeReplyComment({
      series_id,
      post_id,
      comment_id,
      child_id,
      user
    });
  };
  static likeComment = async ({ series_id, post_id, comment_id, user }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const post = series.posts.find((post) => post._id == post_id);
    if (!post) throw new NotFoundError('Post not found');

    const comment = post.comments.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    return await SeriesClass.likeComment({
      series_id,
      post_id,
      comment_id,
      user
    });
  };
  static likePost = async ({ series_id, post_id, user }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const post = series.posts.find((post) => post._id == post_id);
    if (!post) throw new NotFoundError('Post not found');

    return await SeriesClass.likePost({ series_id, post_id, user });
  };
  static deleteReplyComment = async ({ series_id, post_id, comment_id, child_id, user }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const post = series.posts.find((post) => post._id == post_id);
    if (!post) throw new NotFoundError('Post not found');

    const comment = post.comments.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    const reply = comment.child.find((reply) => reply._id == child_id);
    if (!reply) throw new NotFoundError('Reply not found');

    if (reply.user.toString() !== user) throw new ForbiddenError('Unauthorized to delete this reply comment');

    return await SeriesClass.deleteReplyComment({
      series_id,
      post_id,
      comment_id,
      child_id
    });
  };

  static updateReplyComment = async ({ series_id, post_id, comment_id, child_id, user, content }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const post = series.posts.find((post) => post._id == post_id);
    if (!post) throw new NotFoundError('Post not found');

    const comment = post.comments.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    const reply = comment.child.find((reply) => reply._id == child_id);
    if (!reply) throw new NotFoundError('Reply not found');

    if (reply.user.toString() !== user) throw new ForbiddenError('Unauthorized to update this reply comment');

    return await SeriesClass.updateReplyComment({
      series_id,
      post_id,
      comment_id,
      child_id,
      content
    });
  };

  static replyComment = async ({ series_id, post_id, comment_id, user, content }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const post = series.posts.find((post) => post._id == post_id);
    if (!post) throw new NotFoundError('Post not found');

    const comment = post.comments.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    return await SeriesClass.replyComment({
      series_id,
      post_id,
      comment_id,
      user,
      content
    });
  };
  static deleteComment = async ({ series_id, post_id, comment_id, user }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const post = series.posts.find((post) => post._id == post_id);
    if (!post) throw new NotFoundError('Post not found');

    const comment = post.comments.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.user.toString() !== user) throw new ForbiddenError('Unauthorized to delete this comment');

    return await SeriesClass.deleteComment({ series_id, post_id, comment_id });
  };
  static updateComment = async ({ series_id, post_id, comment_id, user, content }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const post = series.posts.find((post) => post._id == post_id);
    if (!post) throw new NotFoundError('Post not found');

    const comment = post.comments.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.user.toString() !== user) throw new ForbiddenError('Unauthorized to update this comment');

    return await SeriesClass.updateComment({
      series_id,
      post_id,
      comment_id,
      content
    });
  };
  static commentPost = async ({ series_id, post_id, user, content }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const post = series.posts.find((post) => post._id == post_id);
    if (!post) throw new NotFoundError('Post not found');

    return await SeriesClass.commentPost({ series_id, post_id, user, content });
  };
  static deleteReview = async ({ series_id, review_id, user }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    const review = series.reviews.find((review) => review._id == review_id);
    if (!review) throw new NotFoundError('Review not found');

    if (review.user.toString() !== user) throw new ForbiddenError('Unauthorized to delete this review');

    return await SeriesClass.deleteReview({ series_id, review_id });
  };
  static reviewSeries = async ({ user, series_id, rating, content }) => {
    const series = await SeriesClass.checkExist({ _id: series_id });
    if (!series) throw new NotFoundError('Series not found');

    if (!rating) throw new BadRequestError('Rating number is required');
    if (!content) throw new BadRequestError('Content is required');

    return await SeriesClass.reviewSeries({ user, series_id, rating, content });
  };
  static deleteSeries = async ({ series_id, user }) => {
    const series = await SeriesClass.checkExist({ _id: series_id, user });
    if (!series) throw new ForbiddenError('Unauthorized to delete this series');

    return await SeriesClass.deleteSeries({ series_id, user });
  };
  static deletePost = async ({ series_id, post_id, user }) => {
    const series = await SeriesClass.checkExist({ _id: series_id, user });
    if (!series) throw new ForbiddenError('Unauthorized to delete this post');

    const post = series.posts.find((post) => post._id == post_id);
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

    const post = series.posts.find((post) => post._id == id);
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
  static getAllSeriesByUserID = async ({ user, page, me_id, limit = 10, sort = { createdAt: -1 } }) => {
    const skip = (parseInt(page) - 1) * limit;

    return await SeriesClass.getAllSeriesByUserID({
      user,
      limit,
      skip,
      sort,
      me_id
    });
  };
  static getAllSeries = async ({ page, me_id, limit = 10, sort = { createdAt: -1 } }) => {
    const skip = (parseInt(page) - 1) * limit;

    return await SeriesClass.getAllSeries({
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
