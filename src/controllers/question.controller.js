'use strict';

import QuestionService from '../services/question.service.js';
import { OK, CREATED } from '../core/success.response.js';
import { HEADER } from '../utils/constants.js';

class QuestionController {
  // Delete Question
  static deleteQuestion = async (req, res, next) => {
    new OK({
      message: 'Delete Question Successfully',
      metadata: await QuestionService.deleteQuestion({
        question_id: req.params.question_id,
        user: req.user.userId
      })
    }).send(res);
  };
  // Update Question
  static updateQuestion = async (req, res, next) => {
    new OK({
      message: 'Update Question Successfully',
      metadata: await QuestionService.updateQuestion({
        question_id: req.params.question_id,
        user: req.user.userId,
        ...req.body
      })
    }).send(res);
  };
  // Vote Question
  static voteQuestion = async (req, res, next) => {
    new OK({
      message: 'Vote Question Successfully',
      metadata: await QuestionService.voteQuestion({
        question_id: req.params.question_id,
        type: req.query.type,
        user: req.user.userId
      })
    }).send(res);
  };
  // View Question
  static viewQuestion = async (req, res, next) => {
    new OK({
      message: 'View Question Successfully',
      metadata: await QuestionService.viewQuestion({
        question_id: req.params.question_id
      })
    }).send(res);
  };
  // Get Question By ID
  static getQuestionById = async (req, res, next) => {
    new OK({
      message: 'Get Question Successfully',
      metadata: await QuestionService.getQuestionById({
        question_id: req.params.question_id
      })
    }).send(res);
  };
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
