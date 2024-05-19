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
