'use strict';

import { HashTagsClass } from '../models/hashtag.model.js';
import { PostClass } from '../models/post.model.js';
import PostService from './post.service.js';

class HashTagService {

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
  static async createOrUpdateHashTag({ rmHashtags = [], post_id, scope = 'Normal' }) {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) return false;
    const hashTags = foundPost.post_attributes.hashtags || [];

    if (rmHashtags.length !== 0) {
      for (let name of rmHashtags) {
        await HashTagsClass.createOrUpdateHashTag({ name, post_id, is_removed: true, scope });
      }
    }

    if (hashTags.length !== 0) {
      for (let name of hashTags) {
        await HashTagsClass.createOrUpdateHashTag({ name, post_id, scope });
      }
    }

    return true;
  }
  static async deletePostHashTags({ post_id, scope = 'Normal' }) {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) return false;

    const hashTags = foundPost.post_attributes.hashtags || [];
    for (let name of hashTags) {
      await HashTagsClass.deletePostHashTags({ name, post_id, scope });
    }
    return true;
  }

  static async deleteSharePostHashTags({ user, post, shared_post }) {
    // Kiểm tra xem đã share bài viết này chưa
    const foundPost = await PostClass.checkExist({
      _id: shared_post,
      'post_attributes.user': user,
      'post_attributes.post': post,
      type: 'Share'
    });

    if (!foundPost) return false;
    const hashTags = foundPost.post_attributes.hashtags || [];
    for (let name of hashTags) {
      await HashTagsClass.deletePostHashTags({ name, post_id: shared_post });
    }
    return true;
  }
}

export default HashTagService;
