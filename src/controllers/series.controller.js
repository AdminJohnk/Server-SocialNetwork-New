'use strict';

import SeriesService from '../services/series.service.js';
import { OK, CREATED } from '../core/success.response.js';
import { HEADER } from '../utils/constants.js';

class SeriesController {
  // Save Post
  static savePost = async (req, res, next) => {
    new OK({
      message: 'Save Post Successfully',
      metadata: await SeriesService.savePost({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Like Reply Comment
  static likeReplyComment = async (req, res, next) => {
    new OK({
      message: 'Like Reply Comment Successfully',
      metadata: await SeriesService.likeReplyComment({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Like Comment
  static likeComment = async (req, res, next) => {
    new OK({
      message: 'Like Comment Successfully',
      metadata: await SeriesService.likeComment({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Like Post
  static likePost = async (req, res, next) => {
    new OK({
      message: 'Like Post Successfully',
      metadata: await SeriesService.likePost({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Delete Reply Comment
  static deleteReplyComment = async (req, res, next) => {
    new OK({
      message: 'Delete Reply Comment Successfully',
      metadata: await SeriesService.deleteReplyComment({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Update Reply Comment
  static updateReplyComment = async (req, res, next) => {
    new OK({
      message: 'Update Reply Comment Successfully',
      metadata: await SeriesService.updateReplyComment({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Reply Comment
  static replyComment = async (req, res, next) => {
    new OK({
      message: 'Reply Comment Successfully',
      metadata: await SeriesService.replyComment({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Delete Comment
  static deleteComment = async (req, res, next) => {
    new OK({
      message: 'Delete Comment Successfully',
      metadata: await SeriesService.deleteComment({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Update Comment
  static updateComment = async (req, res, next) => {
    new OK({
      message: 'Update Comment Successfully',
      metadata: await SeriesService.updateComment({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Comment Post
  static commentPost = async (req, res, next) => {
    new OK({
      message: 'Comment Post Successfully',
      metadata: await SeriesService.commentPost({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Delete Review
  static deleteReview = async (req, res, next) => {
    new OK({
      message: 'Delete Review Successfully',
      metadata: await SeriesService.deleteReview({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Review Series
  static reviewSeries = async (req, res, next) => {
    new OK({
      message: 'Review Series Successfully',
      metadata: await SeriesService.reviewSeries({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  // Delete Series
  static deleteSeries = async (req, res, next) => {
    new OK({
      message: 'Delete Series Successfully',
      metadata: await SeriesService.deleteSeries({
        series_id: req.params.series_id,
        user: req.user.userId
      })
    }).send(res);
  };
  // Delete Post
  static deletePost = async (req, res, next) => {
    new OK({
      message: 'Delete Post Successfully',
      metadata: await SeriesService.deletePost({
        series_id: req.params.series_id,
        post_id: req.params.post_id,
        user: req.user.userId
      })
    }).send(res);
  };
  // Update Post
  static updatePost = async (req, res, next) => {
    new OK({
      message: 'Update Post Successfully',
      metadata: await SeriesService.updatePost({
        ...req.body,
        series_id: req.params.series_id,
        user: req.user.userId
      })
    }).send(res);
  };
  // Create Post
  static createPost = async (req, res, next) => {
    new CREATED({
      message: 'Create Post Successfully',
      metadata: await SeriesService.createPost({
        ...req.body,
        series_id: req.params.series_id,
        user: req.user.userId
      })
    }).send(res);
  };

  // Update Series
  static updateSeries = async (req, res, next) => {
    new OK({
      message: 'Update Series Successfully',
      metadata: await SeriesService.updateSeries({
        ...req.body,
        series_id: req.params.series_id,
        user: req.user.userId
      })
    }).send(res);
  };
  // Get Series By ID
  static getSeriesById = async (req, res, next) => {
    new OK({
      message: 'Get Series By ID Successfully',
      metadata: await SeriesService.getSeriesById({
        series_id: req.params.series_id,
        me_id: req.user.userId
      })
    }).send(res);
  };

  // Get All Series
  static getAllSeries = async (req, res, next) => {
    new OK({
      message: 'Get All Series Successfully',
      metadata: await SeriesService.getAllSeries({
        user: req.params.profile_id,
        page: req.query.page,
        me_id: req.user.userId
      })
    }).send(res);
  };

  // Create Series
  static createSeries = async (req, res, next) => {
    new CREATED({
      message: 'Create Series Successfully',
      metadata: await SeriesService.createSeries({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
}

export default SeriesController;
