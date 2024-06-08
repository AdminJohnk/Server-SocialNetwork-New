'use strict';

import { User } from 'discord.js';
import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../core/error.response.js';
import { redis } from '../database/init.redis.js';

import { QuestionClass } from '../models/question.model.js';
import { UserClass } from '../models/user.model.js';
import HashTagService from './hashtag.service.js';

class QuestionService {
  static getAllListQuestion = async ({ user }) => {
    return await UserClass.getAllListQuestion({ user });
  }
  static createListQuestion = async ({ user, name }) => {
    return await UserClass.createListQuestion({ user, name });
  };
  static getHotQuestions = async () => {
    return await QuestionClass.getHotQuestions();
  };
  static getRelatedQuestions = async ({ question_id }) => {
    return await QuestionClass.getRelatedQuestions({ question_id });
  };
  static getSavedQuestions = async ({ user }) => {
    return await UserClass.getSavedQuestions({ user });
  };
  static getNumberQuestionByTag = async ({ tagname, sort }) => {
    return await HashTagService.getNumberQuestionByTag({ name: tagname, sort });
  };
  static getAllQuestionByTag = async ({ name, page, sort, limit = 20 }) => {
    const skip = (page - 1) * limit;
    return await HashTagService.getAllQuestionByTag({ name, limit, skip, sort });
  };
  static getAllQuestionByTag = async ({ tagname, page, sort }) => {
    return await HashTagService.getAllQuestionByTag({ name: tagname, page, sort });
  };
  static findTagsQuestion = async ({ tagname, page, sort }) => {
    return await HashTagService.findTagsQuestion({ tag: tagname, page, sort });
  };
  static getNumberTagsQuestion = async ({ tag }) => {
    return await HashTagService.getNumberTagsQuestion({ tag });
  };
  static getAllTags = async ({ page, sort }) => {
    const HashTags = await HashTagService.getAllHashTagsQuestion({
      page,
      sort
    });
    return HashTags;
  };
  static getNumberQuestions = async () => {
    return await QuestionClass.getNumberQuestions();
  };
  static getAllQuestions = async ({ page, sort, limit = 20 }) => {
    const skip = (page - 1) * limit;
    return await QuestionClass.getAllQuestions({ skip, limit, sort });
  };
  static saveQuestion = async ({ user, question_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    await UserClass.saveQuestion({ user, question_id });

    return await QuestionClass.saveQuestion({ user, question_id });
  };
  static voteAnswer = async ({ user, question_id, answer_id, type, old }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find((answer) => answer._id == answer_id);
    if (!answer) throw new NotFoundError('Answer not found');

    const vote_score = await QuestionClass.voteAnswer({
      question_id,
      answer_id,
      type,
      old,
      user
    });

    const authorAnswer = answer.user.toString();

    // Nếu tự vote cho bản thân thì không thay đổi reputation
    if (authorAnswer === user) return true;

    UserClass.changeReputation({ user_id: authorAnswer, number: vote_score });

    return true;
  };
  static voteCommentAnswer = async ({ user, question_id, answer_id, comment_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find((answer) => answer._id == answer_id);
    if (!answer) throw new NotFoundError('Answer not found');

    const comment = answer.comment.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    const authorComment = comment.user.toString();

    const vote_score = await QuestionClass.voteCommentAnswer({
      question_id,
      answer_id,
      comment_id,
      user
    });

    // Nếu tự vote cho bản thân thì không thay đổi reputation
    if (authorComment === user) return true;

    UserClass.changeReputation({ user_id: authorComment, number: vote_score });

    return true;
  };
  static updateCommentAnswer = async ({ user, question_id, answer_id, comment_id, content }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find((answer) => answer._id == answer_id);
    if (!answer) throw new NotFoundError('Answer not found');

    const comment = answer.comment.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.user.toString() !== user) throw new ForbiddenError('Unauthorized to update this comment');

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

    const answer = foundQuestion.answers.find((answer) => answer._id == answer_id);
    if (!answer) throw new NotFoundError('Answer not found');

    if (!content) throw new BadRequestError('Content is required');

    const result = await QuestionClass.commentAnswer({
      question_id,
      answer_id,
      user,
      content
    });

    UserClass.changeReputation({ user_id: user, number: 0.5 });

    return result;
  };
  static deleteAnswer = async ({ user, question_id, answer_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find((answer) => answer._id == answer_id);
    if (!answer) throw new NotFoundError('Answer not found');

    if (answer.user.toString() !== user && foundQuestion.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to delete this answer');

    const result = await QuestionClass.deleteAnswer({ question_id, answer_id });

    UserClass.changeReputation({ user_id: user, number: -1 });

    return result;
  };
  static updateAnswer = async ({ user, question_id, answer_id, content }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find((answer) => answer._id == answer_id);
    if (!answer) throw new NotFoundError('Answer not found');

    if (answer.user.toString() !== user) throw new ForbiddenError('Unauthorized to update this answer');

    return await QuestionClass.updateAnswer({
      question_id,
      answer_id,
      content
    });
  };
  static deleteCommentAnswer = async ({ user, question_id, answer_id, comment_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const answer = foundQuestion.answers.find((answer) => answer._id == answer_id);
    if (!answer) throw new NotFoundError('Answer not found');

    const comment = answer.comment.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.user.toString() !== user && foundQuestion.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to delete this comment');

    const result = await QuestionClass.deleteCommentAnswer({
      question_id,
      answer_id,
      comment_id
    });

    UserClass.changeReputation({ user_id: user, number: -0.5 });

    return result;
  };
  static answerQuestion = async ({ user, question_id, content }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    if (!content) throw new BadRequestError('Content is required');

    const result = await QuestionClass.answerQuestion({ question_id, user, content });

    return result;
  };
  static voteCommentQuestion = async ({ user, question_id, comment_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const comment = foundQuestion.comment.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    const vote_score = await QuestionClass.voteCommentQuestion({
      question_id,
      comment_id,
      user
    });

    const authorComment = comment.user.toString();

    // Nếu tự vote cho bản thân thì không thay đổi reputation
    if (authorComment === user) return true;

    UserClass.changeReputation({ user_id: authorComment, number: vote_score });

    return true;
  };
  static deleteCommentQuestion = async ({ user, question_id, comment_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const comment = foundQuestion.comment.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.user.toString() !== user && foundQuestion.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to delete this comment');

    const result = await QuestionClass.deleteCommentQuestion({
      question_id,
      comment_id
    });

    UserClass.changeReputation({ user_id: user, number: -0.5 });

    return result;
  };
  static updateCommentQuestion = async ({ user, question_id, comment_id, content }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const comment = foundQuestion.comment.find((comment) => comment._id == comment_id);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.user.toString() !== user) throw new ForbiddenError('Unauthorized to update this comment');

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

    const result = await QuestionClass.commentQuestion({ question_id, user, content });

    UserClass.changeReputation({ user_id: user, number: 0.5 });

    return result;
  };
  static deleteQuestion = async ({ question_id, user }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    if (foundQuestion.user.toString() !== user && foundQuestion.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to delete this question');

    await HashTagService.deletePostHashTags({ question_id, scope: 'Question' });

    return await QuestionClass.deleteQuestion(question_id);
  };
  static updateQuestion = async ({ question_id, user, title, problem, expect, text, hashtags }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    if (foundQuestion.user.toString() !== user)
      throw new ForbiddenError('Unauthorized to update this question');

    const oldHashTag = foundQuestion.hashtags;
    const rmHashtags = oldHashTag.filter((oldTag) => !hashtags.includes(oldTag));

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
  static voteQuestion = async ({ question_id, type, user, old }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const vote_score_ = await QuestionClass.voteQuestion({ question_id, type, user, old });

    const authorQuestion = foundQuestion.user.toString();

    // Nếu tự vote cho bản thân thì không thay đổi reputation
    if (authorQuestion === user) return true;

    UserClass.changeReputation({ user_id: authorQuestion, number: vote_score_ });

    return true;
  };
  static viewQuestion = async ({ question_id, me_id }) => {
    const foundQuestion = await QuestionClass.checkExist({ _id: question_id });
    if (!foundQuestion) throw new NotFoundError('Question not found');

    const isViewed = await redis.get(`question:${question_id}:user:${me_id}:view`);
    if (isViewed) return true;

    await redis.setex(`question:${question_id}:user:${me_id}:view`, 5 * 60, 1);

    await QuestionClass.viewQuestion({ question_id });
    return true;
  };
  static getQuestionById = async ({ question_id }) => {
    const question = await QuestionClass.getQuestionById(question_id);
    if (!question) throw new NotFoundError('Question not found');
    return question;
  };
  static createQuestion = async ({ user, title, problem, expect, text, hashtags }) => {
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
