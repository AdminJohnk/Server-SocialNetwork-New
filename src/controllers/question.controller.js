'use strict';

import QuestionService from '../services/question.service.js';
import { OK, CREATED } from '../core/success.response.js';
import { HEADER } from '../utils/constants.js';

class QuestionController {
  // Get Number Tags Questions
  static getNumberTagsQuestion = async (req, res, next) => {
    new OK({
      message: 'Get Number Tags Questions Successfully',
      metadata: await QuestionService.getNumberTagsQuestion()
    }).send(res);
  };
  // Get All Tags
  static getAllTags = async (req, res, next) => {
    new OK({
      message: 'Get All Tags Successfully',
      metadata: await QuestionService.getAllTags({
        page: req.query.page,
        sort: req.query.sort
      })
    }).send(res);
  };
  // Get Number Questions
  static getNumberQuestions = async (req, res, next) => {
    new OK({
      message: 'Get Number Questions Successfully',
      metadata: await QuestionService.getNumberQuestions()
    }).send(res);
  };
  // Get All Questions
  static getAllQuestions = async (req, res, next) => {
    new OK({
      message: 'Get All Questions Successfully',
      metadata: await QuestionService.getAllQuestions({
        page: req.query.page
      })
    }).send(res);
  };
  // Save Question
  static saveQuestion = async (req, res, next) => {
    new OK({
      message: 'Save Question Successfully',
      metadata: await QuestionService.saveQuestion({
        user: req.user.userId,
        question_id: req.params.question_id
      })
    }).send(res);
  };
  // Vote Answer
  static voteAnswer = async (req, res, next) => {
    new OK({
      message: 'Vote Answer Successfully',
      metadata: await QuestionService.voteAnswer({
        user: req.user.userId,
        question_id: req.params.question_id,
        ...req.body
      })
    }).send(res);
  };
  // Vote Comment Answer
  static voteCommentAnswer = async (req, res, next) => {
    new OK({
      message: 'Vote Comment Answer Successfully',
      metadata: await QuestionService.voteCommentAnswer({
        user: req.user.userId,
        question_id: req.params.question_id,
        ...req.body
      })
    }).send(res);
  };

  // Update Comment Answer
  static updateCommentAnswer = async (req, res, next) => {
    new OK({
      message: 'Update Comment Answer Successfully',
      metadata: await QuestionService.updateCommentAnswer({
        user: req.user.userId,
        question_id: req.params.question_id,
        ...req.body
      })
    }).send(res);
  };
  // Comment Answer
  static commentAnswer = async (req, res, next) => {
    new OK({
      message: 'Comment Answer Successfully',
      metadata: await QuestionService.commentAnswer({
        user: req.user.userId,
        question_id: req.params.question_id,
        ...req.body
      })
    }).send(res);
  };
  // Delete Answer
  static deleteAnswer = async (req, res, next) => {
    new OK({
      message: 'Delete Answer Successfully',
      metadata: await QuestionService.deleteAnswer({
        user: req.user.userId,
        question_id: req.params.question_id,
        ...req.body
      })
    }).send(res);
  };
  // Update Answer
  static updateAnswer = async (req, res, next) => {
    new OK({
      message: 'Update Answer Successfully',
      metadata: await QuestionService.updateAnswer({
        user: req.user.userId,
        question_id: req.params.question_id,
        ...req.body
      })
    }).send(res);
  };
  // Delete Comment Answer
  static deleteCommentAnswer = async (req, res, next) => {
    new OK({
      message: 'Delete Answer Comment Successfully',
      metadata: await QuestionService.deleteCommentAnswer({
        user: req.user.userId,
        question_id: req.params.question_id,
        ...req.body
      })
    }).send(res);
  };
  // Answer Question
  static answerQuestion = async (req, res, next) => {
    new OK({
      message: 'Answer Question Successfully',
      metadata: await QuestionService.answerQuestion({
        user: req.user.userId,
        question_id: req.params.question_id,
        ...req.body
      })
    }).send(res);
  };
  // Vote Comment Question
  static voteCommentQuestion = async (req, res, next) => {
    new OK({
      message: 'Vote Comment Question Successfully',
      metadata: await QuestionService.voteCommentQuestion({
        user: req.user.userId,
        question_id: req.params.question_id,
        ...req.body
      })
    }).send(res);
  };
  // Delete Comment Question
  static deleteCommentQuestion = async (req, res, next) => {
    new OK({
      message: 'Delete Question Comment Successfully',
      metadata: await QuestionService.deleteCommentQuestion({
        user: req.user.userId,
        question_id: req.params.question_id,
        ...req.body
      })
    }).send(res);
  };
  // Update Comment Question
  static updateCommentQuestion = async (req, res, next) => {
    new OK({
      message: 'Update Comment Question Successfully',
      metadata: await QuestionService.updateCommentQuestion({
        user: req.user.userId,
        question_id: req.params.question_id,
        ...req.body
      })
    }).send(res);
  };
  // Comment Question
  static commentQuestion = async (req, res, next) => {
    new OK({
      message: 'Comment Question Successfully',
      metadata: await QuestionService.commentQuestion({
        question_id: req.params.question_id,
        user: req.user.userId,
        ...req.body
      })
    }).send(res);
  };
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
        question_id: req.params.question_id,
        me_id: req.user.userId
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
