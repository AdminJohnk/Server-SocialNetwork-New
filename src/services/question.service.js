'use strict';

import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../core/error.response.js';

import { QuestionClass } from '../models/question.model.js';
import { UserClass } from '../models/user.model.js';

class QuestionService {
  static deleteQuestion = async ({ question_id, user }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    if (foundQuestion.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to delete this question');

    return await QuestionClass.deleteQuestion(question_id);
  };
  static updateQuestion = async ({
    question_id,
    user,
    title,
    problem,
    expect,
    hashtags
  }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    if (foundQuestion.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to update this question');

    return await QuestionClass.updateQuestion({
      question_id,
      title,
      problem,
      expect,
      hashtags
    });
  };
  static voteQuestion = async ({ question_id, type, user }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    return await QuestionClass.voteQuestion({ question_id, type, user });
  };
  static viewQuestion = async ({ question_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    await QuestionClass.viewQuestion({ question_id });
    return true;
  };
  static getQuestionById = async ({ question_id }) => {
    const question = await QuestionClass.getQuestionById(question_id);
    if (!question) throw new NotFoundError('Question not found');
    return question;
  };
  static createQuestion = async ({
    user,
    title,
    problem,
    expect,
    hashtags
  }) => {
    if (!title) throw new BadRequestError('Title is required');
    if (!problem) throw new BadRequestError('Problem is required');
    if (!expect) throw new BadRequestError('Expect is required');
    if (!hashtags) throw new BadRequestError('Hashtags is required');

    return await QuestionClass.createQuestion({
      user,
      title,
      problem,
      expect,
      hashtags
    });
  };

  //   static updatePost = async ({
  //     series_id,
  //     id,
  //     user,
  //     title,
  //     description,
  //     content,
  //     cover_image,
  //     visibility,
  //     read_time
  //   }) => {
  //     const series = await SeriesClass.checkExist({ _id: series_id, user });
  //     if (!series) throw new ForbiddenError('Unauthorized to update this post');
  //     const post = series.posts.find(post => post._id == id);
  //     if (!post) throw new NotFoundError('Post not found');
  //     if (!title) throw new BadRequestError('Title is required');
  //     if (!description) throw new BadRequestError('Description is required');
  //     if (!content) throw new BadRequestError('Content is required');
  //     if (!cover_image) throw new BadRequestError('Images is required');
  //     if (!visibility) throw new BadRequestError('Visibility is required');
  //     if (!read_time) throw new BadRequestError('Read time is required');
  //     return await SeriesClass.updatePost({
  //       series_id,
  //       id,
  //       title,
  //       description,
  //       content,
  //       cover_image,
  //       visibility,
  //       read_time
  //     });
  //   };
}

export default QuestionService;
