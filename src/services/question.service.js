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
import HashTagService from './hashtag.service.js';

class QuestionService {
  static getAllTags = async ({ page }) => {
    const HashTags = await HashTagService.getAllHashTagsQuestion({
      page
    });
    return HashTags
  };
  static getNumberQuestions = async () => {
    return await QuestionClass.getNumberQuestions();
  };
  static getAllQuestions = async ({ page, limit = 20 }) => {
    const skip = (page - 1) * limit;
    return await QuestionClass.getAllQuestions({ skip, limit });
  };
  static saveQuestion = async ({ user, question_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    await UserClass.saveQuestion({ user, question_id });

    return await QuestionClass.saveQuestion({ user, question_id });
  };
  static voteAnswer = async ({ user, question_id, answer_id, type }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find(
      answer => answer._id == answer_id
    );
    if (!answer) throw new NotFoundError('Answer not found');

    return await QuestionClass.voteAnswer({
      question_id,
      answer_id,
      type,
      user
    });
  };
  static voteCommentAnswer = async ({
    user,
    question_id,
    answer_id,
    comment_id
  }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find(
      answer => answer._id == answer_id
    );
    if (!answer) throw new NotFoundError('Answer not found');

    const comment = answer.comment.find(comment => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    return await QuestionClass.voteCommentAnswer({
      question_id,
      answer_id,
      comment_id,
      user
    });
  };
  static updateCommentAnswer = async ({
    user,
    question_id,
    answer_id,
    comment_id,
    content
  }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find(
      answer => answer._id == answer_id
    );
    if (!answer) throw new NotFoundError('Answer not found');

    const comment = answer.comment.find(comment => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to update this comment');

    return await QuestionClass.updateCommentAnswer({
      question_id,
      answer_id,
      comment_id,
      content
    });
  };
  static commentAnswer = async ({ user, question_id, answer_id, content }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find(
      answer => answer._id == answer_id
    );
    if (!answer) throw new NotFoundError('Answer not found');

    if (!content) throw new BadRequestError('Content is required');

    return await QuestionClass.commentAnswer({
      question_id,
      answer_id,
      user,
      content
    });
  };
  static deleteAnswer = async ({ user, question_id, answer_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find(
      answer => answer._id == answer_id
    );
    if (!answer) throw new NotFoundError('Answer not found');

    if (answer.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to delete this answer');

    return await QuestionClass.deleteAnswer({ question_id, answer_id });
  };
  static updateAnswer = async ({ user, question_id, answer_id, content }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find(
      answer => answer._id == answer_id
    );
    if (!answer) throw new NotFoundError('Answer not found');

    if (answer.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to update this answer');

    return await QuestionClass.updateAnswer({
      question_id,
      answer_id,
      content
    });
  };
  static deleteCommentAnswer = async ({
    user,
    question_id,
    answer_id,
    comment_id
  }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find(
      answer => answer._id == answer_id
    );
    if (!answer) throw new NotFoundError('Answer not found');

    const comment = answer.comment.find(comment => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to delete this comment');

    return await QuestionClass.deleteCommentAnswer({
      question_id,
      answer_id,
      comment_id
    });
  };
  static answerQuestion = async ({ user, question_id, content }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    if (!content) throw new BadRequestError('Content is required');

    return await QuestionClass.answerQuestion({ question_id, user, content });
  };
  static voteCommentQuestion = async ({ user, question_id, comment_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const comment = foundQuestion.comment.find(
      comment => comment._id == comment_id
    );
    if (!comment) throw new NotFoundError('Comment not found');

    return await QuestionClass.voteCommentQuestion({
      question_id,
      comment_id,
      user
    });
  };
  static deleteCommentQuestion = async ({ user, question_id, comment_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const comment = foundQuestion.comment.find(
      comment => comment._id == comment_id
    );
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to delete this comment');

    return await QuestionClass.deleteCommentQuestion({
      question_id,
      comment_id
    });
  };
  static updateCommentQuestion = async ({
    user,
    question_id,
    comment_id,
    content
  }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const comment = foundQuestion.comment.find(
      comment => comment._id == comment_id
    );
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to update this comment');

    return await QuestionClass.updateCommentQuestion({
      question_id,
      comment_id,
      content
    });
  };
  static commentQuestion = async ({ question_id, user, content }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    if (!content) throw new BadRequestError('Content is required');

    return await QuestionClass.commentQuestion({ question_id, user, content });
  };
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
    text,
    hashtags
  }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    if (foundQuestion.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to update this question');

    const oldHashTag = foundQuestion.hashtags;
    const rmHashtags = oldHashTag.filter(oldTag => !hashtags.includes(oldTag));

    const question = await QuestionClass.updateQuestion({
      question_id,
      title,
      problem,
      expect,
      text,
      hashtags
    });

    HashTagService.createOrUpdateHashTag({
      rmHashtags,
      question_id,
      scope: 'Question'
    });

    return question;
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
    text,
    hashtags
  }) => {
    if (!title) throw new BadRequestError('Title is required');
    if (!problem) throw new BadRequestError('Problem is required');
    if (!expect) throw new BadRequestError('Expect is required');
    if (!hashtags) throw new BadRequestError('Hashtags is required');

    const result = await QuestionClass.createQuestion({
      user,
      title,
      problem,
      expect,
      text,
      hashtags
    });

    HashTagService.createOrUpdateHashTag({
      question_id: result._id.toString(),
      scope: 'Question'
    });

    return result;
  };
}

export default QuestionService;
