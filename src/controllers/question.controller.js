'use strict';

import QuestionService from '../services/question.service.js';
import { OK, CREATED } from '../core/success.response.js';
import { HEADER } from '../utils/constants.js';

class QuestionController {
  // Create Question
  static createQuestion = async (req, res, next) => {
    new CREATED({
      message: 'Create Question Successfully',
      metadata: await QuestionService.createQuestion({
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

export default QuestionController;
