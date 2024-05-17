'use strict';

import SeriesService from '../services/series.service.js';
import { OK, CREATED } from '../core/success.response.js';
import { HEADER } from '../utils/constants.js';

class SeriesController {
  // Comment Post
  static commentPost = async (req, res, next) => {
    new OK({
      message: 'Comment Post Successfully',
      metadata: await SeriesService.commentPost({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  }
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

  // /* Delete Images */
  // static deleteImages = async (req, res, next) => {
  //   new OK({
  //     message: 'Delete Image Successfully',
  //     metadata: await ImageService.deleteImages({
  //       ...req.body
  //     })
  //   }).send(res);
  // };
  // /*  Upload Images */
  // static uploadImages = async (req, res, next) => {
  //   new OK({
  //     message: 'Upload Images Successfully',
  //     metadata: await ImageService.uploadImages({
  //       images: req.files,
  //       user: req.user.userId
  //     })
  //   }).send(res);
  // };
  // /*  Upload Image */
  // static uploadImage = async (req, res, next) => {
  //   new OK({
  //     message: 'Upload Image Successfully',
  //     metadata: await ImageService.uploadImage({
  //       image: req.file,
  //       user: req.user.userId
  //     })
  //   }).send(res);
  // };
}

export default SeriesController;
