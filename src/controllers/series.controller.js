'use strict';

import SeriesService from '../services/series.service.js';
import { OK, CREATED } from '../core/success.response.js';
import { HEADER } from '../utils/constants.js';

class SeriesController {
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
        user: req.user.userId
      })
    }).send(res);
  };

  // Get All Series
  static getAllSeries = async (req, res, next) => {
    new OK({
      message: 'Get All Series Successfully',
      metadata: await SeriesService.getAllSeries({
        user: req.params.profile_id,
        page: req.query.page
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
