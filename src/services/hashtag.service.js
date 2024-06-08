'use strict';

import { NotFoundError } from '../core/error.response.js';
import { HashTagsClass } from '../models/hashtag.model.js';
import { PostClass } from '../models/post.model.js';
import { QuestionClass } from '../models/question.model.js';

class HashTagService {
  static async getAllHashTagsQuestion({ page, limit = 24 }) {
    const skip = (page - 1) * 10;
    return await HashTagsClass.getAllHashTagsQuestion({ skip, limit });
  }
  static async getAllHashTags({ sort = { createdAt: -1 } }) {
    return await HashTagsClass.getAllHashTags({ sort });
  }
  static async getNormalPostByHashtag({ name }) {
    return await HashTagsClass.getNormalPostByHashtag({ name });
  }
  static async getCommunityPostByHashtag({ name }) {
    return await HashTagsClass.getCommunityPostByHashtag({ name });
  }
  static async getQuestionByHashtag({ name }) {
    return await HashTagsClass.getQuestionByHashtag({ name });
  }
  static async createOrUpdateHashTag({
    rmHashtags = [],
    post_id,
    question_id,
    scope = 'Normal'
  }) {
    let hashTags;

    if (scope === 'Normal' || scope === 'Community') {
      const foundPost = await PostClass.checkExist({ _id: post_id });
      if (!foundPost) throw new NotFoundError('Post not found');
      hashTags = foundPost.post_attributes.hashtags || [];
    } else if (scope === 'Question') {
      const foundQuestion = await QuestionClass.checkExist({
        _id: question_id
      });
      if (!foundQuestion) throw new NotFoundError('Question not found');
      hashTags = foundQuestion.hashtags || [];
    }

    if (rmHashtags.length > 0) {
      for (let name of rmHashtags) {
        await HashTagsClass.createOrUpdateHashTag({
          name,
          post_id,
          is_removed: true,
          question_id,
          scope
        });
      }
    }

    if (hashTags.length > 0) {
      for (let name of hashTags) {
        await HashTagsClass.createOrUpdateHashTag({
          name,
          post_id,
          question_id,
          scope
        });
      }
    }

    return true;
  }
  static async deletePostHashTags({ post_id, question_id, scope = 'Normal' }) {
    let hashTags;

    if (scope === 'Normal' || scope === 'Community') {
      const foundPost = await PostClass.checkExist({ _id: post_id });
      if (!foundPost) throw new NotFoundError('Post not found');
      hashTags = foundPost.post_attributes.hashtags || [];
    } else if (scope === 'Question') {
      const foundQuestion = await QuestionClass.checkExist({
        _id: question_id
      });
      if (!foundQuestion) throw new NotFoundError('Question not found');
      hashTags = foundQuestion.hashtags || [];
    }
    return await HashTagsClass.deletePostHashTags({ post_id, question_id, hashTags, scope });
  }
}

export default HashTagService;
