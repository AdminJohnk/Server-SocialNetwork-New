'use strict';

import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../core/error.response.js';
import { getInfoData, limitData, removeFalsyFields, updateNestedObjectParser } from '../utils/functions.js';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { RoleUser } from '../utils/constants.js';
import { PostClass } from '../models/post.model.js';
import { UserClass } from '../models/user.model.js';
import { LikeClass } from '../models/like.model.js';
import { CommunityClass } from '../models/community.model.js';
import NotificationService from './notification.service.js';
import PublisherService from './publisher.service.js';
import { Notification } from '../utils/notificationType.js';
import ImageService from './image.service.js';
import HashTagService from './hashtag.service.js';

const { CREATEPOST_001, SHAREPOST_001 } = Notification;

class PostService {
  static async linkPreview({ url }) {
    const extractMetaTags = async (url) => {
      try {
        const response = await axios.get(url);
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        const metaTags = Array.from(document.querySelectorAll('meta')).reduce((tags, meta) => {
          const name =
            meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('itemprop');
          const content = meta.getAttribute('content');

          if (name && content) {
            tags[name] = content;
          }

          return tags;
        }, {});

        return {
          title: document.title || metaTags['og:title'] || metaTags['twitter:title'],
          description: metaTags.description || metaTags['og:description'] || metaTags['twitter:description'],
          image: metaTags.image || metaTags['og:image'] || metaTags['twitter:image']
        };
      } catch (error) {
        console.error('Error fetching Open Graph details', error);
      }
    };

    return await extractMetaTags(url);
  }
  static async getAllImage({ user_id }) {
    const foundUser = await UserClass.checkExist({ _id: user_id });
    if (!foundUser) throw new NotFoundError('User not found');

    return await PostClass.getAllImage({ user_id });
  }
  static async viewPost({ post_id, user_id, cookies, res }) {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.viewPost({ post_id, user_id, cookies, res });
  }
  static async getAllPopularPost({
    user_id,
    limit = 3,
    page = 1,
    sort = { 'post_attributes.view_number': -1 },
    scope = 'Normal',
    sortBy
  }) {
    const skip = (page - 1) * limit;

    return await PostClass.getAllPopularPost({
      user_id,
      limit,
      skip,
      sort,
      scope,
      sortBy
    });
  }
  static async getAllPostForNewsFeed({
    user_id,
    limit = 5,
    page = 1,
    sort = { createdAt: -1 },
    scope = 'Normal'
  }) {
    const skip = (parseInt(page) - 1) * limit;

    return await PostClass.getAllPostForNewsFeed({
      user_id,
      limit,
      skip,
      sort,
      scope
    });
  }
  static async getAllUserSavePost({ post, owner_post, limit = 10, page = 1, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;

    const foundPost = await PostClass.checkExist({
      _id: post,
      'post_attributes.user': owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.getAllUserSavePost({
      post,
      owner_post,
      limit,
      skip,
      sort
    });
  }
  static async getAllUserSharePost({ post, owner_post, limit = 10, page = 1, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;

    const foundPost = await PostClass.checkExist({
      _id: post,
      'post_attributes.user': owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.getAllUserSharePost({
      post,
      owner_post,
      limit,
      skip,
      sort
    });
  }
  static async getAllUserLikePost({ post, owner_post, limit = 10, page = 1, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;

    const foundPost = await PostClass.checkExist({
      _id: post,
      'post_attributes.user': owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    return await PostClass.getAllUserLikePost({
      post,
      owner_post,
      limit,
      skip,
      sort
    });
  }
  static async deletePost({ post_id, user_id, scope, community }) {
    const foundPost = await PostClass.checkExist({
      _id: post_id,
      'post_attributes.user': user_id
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    // Xét thêm điều kiện nếu là post trong community
    if (scope === 'Community') {
      // Check xem community có tồn tại không
      // Check xem user có phải member của community không
      // Check xem post có thuộc community không
      const condition = {
        _id: community,
        members: { $in: [user_id] },
        posts: { $in: [post_id] }
      };
      const foundCommunity = await CommunityClass.checkExist(condition);
      if (!foundCommunity) throw new NotFoundError('Community not found');
    }

    const removeImages = foundPost.post_attributes.images;
    if (removeImages.length > 0) {
      await ImageService.deleteImages({ images: removeImages });
    } // Xóa ảnh trong S3

    // Xóa hash tag
    await HashTagService.deletePostHashTags({ post_id, scope });

    const result = await PostClass.deletePost({ post_id });

    // Xóa post trong community
    if (scope === 'Community') {
      await CommunityClass.changeToArrayCommunity({
        community_id: community,
        type: 'post',
        itemID: result._id,
        number: -1
      });
    }

    UserClass.changeNumberUser({
      user_id,
      type: 'post',
      number: -1
    }).catch((err) => console.log(err));

    return result;
  }
  static async updatePost({
    post_id,
    user_id,
    content,
    hashtags,
    rmHashtags,
    title,
    scope,
    community,
    images,
    visibility
  }) {
    let post_attributes = { content, title, images, hashtags };
    const foundPost = await PostClass.checkExist({
      _id: post_id,
      'post_attributes.user': user_id
    });
    if (!foundPost) throw new NotFoundError('Post not found');
    post_attributes = removeFalsyFields(post_attributes);

    // Check xem user có thể chỉnh sửa post hay không? (user là người tạo post)
    if (foundPost.post_attributes.user.toString() !== user_id)
      throw new ForbiddenError('You do not have permission to edit this post');

    // Xét thêm điều kiện nếu là post trong community
    if (scope === 'Community') {
      // Check xem community có tồn tại không
      // Check xem user có phải member của community không
      // Check xem post có thuộc community không
      const condition = {
        _id: community,
        members: { $in: [user_id] },
        posts: { $in: [post_id] }
      };
      const foundCommunity = await CommunityClass.checkExist(condition);
      if (!foundCommunity) throw new NotFoundError('Community not found');
    }

    // update hash tag

    const updatePost = await PostClass.updatePost({
      post_id,
      user_id,
      payload: updateNestedObjectParser({
        visibility,
        post_attributes
      })
    });

    HashTagService.createOrUpdateHashTag({ rmHashtags, post_id, scope });

    return updatePost;
  }
  static async getAllPost({ user_id, limit = 10, page = 1, sort = 'ctime' }) {
    const skip = (page - 1) * limit;
    const foundUser = await UserClass.checkExist({ _id: user_id });
    if (!foundUser.role.includes(RoleUser.ADMIN))
      throw new ForbiddenError('You do not have admin permission');

    return await PostClass.getAllPost({ limit, skip, sort });
  }
  static async getAllPostByUserId({
    user_id,
    me_id,
    limit = 5,
    page = 1,
    sort = { createdAt: -1 },
    scope = 'Normal'
  }) {
    const foundUser = await UserClass.checkExist({ _id: user_id });
    if (!foundUser) throw new NotFoundError('User not found');

    let isFullSearch = false;

    if (user_id === me_id) {
      isFullSearch = true;
    }

    const skip = (parseInt(page) - 1) * limit;

    return PostClass.getAllPostByUserId({
      user_id,
      me_id,
      limit,
      skip,
      sort,
      scope,
      isFullSearch
    });
  }
  static async getPostById({ post_id, user, scope = 'Normal' }) {
    const foundPost = await PostClass.checkExist({ _id: post_id });
    if (!foundPost) throw new NotFoundError('Post not found');

    let isFullSearch = false;

    if (user === foundPost.post_attributes.user.toString()) {
      isFullSearch = true;
    }

    return await PostClass.findByID({ post_id, user, scope, isFullSearch });
  }

  static async sharePost({ user, post, owner_post, content, hashtags }) {
    const foundPost = await PostClass.checkExist({
      _id: post,
      'post_attributes.user': owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');

    const { numShare, postShare } = await PostClass.sharePost({
      user,
      post,
      owner_post,
      content,
      hashtags
    });

    if (user !== owner_post && numShare === 1) {
      HashTagService.createOrUpdateHashTag({ post_id: postShare._id });

      const msg = NotificationService.createMsgToPublish({
        type: SHAREPOST_001,
        sender: user,
        receiver: owner_post,
        post: postShare._id
      });

      PublisherService.publishNotify(msg);
    }

    return true;
  }

  static async deleteSharePost({ user, post, owner_post, shared_post }) {
    const foundPost = await PostClass.checkExist({
      _id: post,
      'post_attributes.user': owner_post
    });
    if (!foundPost) throw new NotFoundError('Post not found');
    // Xóa hash tag
    await HashTagService.deletePostHashTags({ post_id: shared_post });

    await PostClass.deleteSharePost({ user, post, shared_post });

    return true;
  }

  static async createPost({
    type = 'Post',
    user,
    content,
    images,
    hashtags,
    tags,
    scope = 'Normal',
    community,
    visibility
  }) {
    if (!content) throw new BadRequestError('Post must have title or content');
    const result = await PostClass.createPost({
      type,
      user,
      content,
      images,
      hashtags,
      scope,
      community,
      visibility,
      hashtags,
      tags
    });

    UserClass.changeNumberUser({
      user_id: user,
      type: 'post',
      number: 1
    });

    // Thông báo đến bạn bè
    if (scope === 'Normal' && visibility !== 'private') {
      const msg = NotificationService.createMsgToPublish({
        type: CREATEPOST_001,
        sender: user,
        post: result._id
      });

      PublisherService.publishNotify(msg);
    }

    // Thêm post trong community
    if (scope === 'Community') {
      const foundCommunity = await CommunityClass.checkExist({
        _id: community
      });

      if (!foundCommunity) throw new NotFoundError('Community not found');

      const isAdmin = foundCommunity.admins.some((admin) => admin.toString() === user);

      if (!isAdmin)
        await CommunityClass.changeToArrayCommunity({
          community_id: community,
          type: 'waitlist_post',
          itemID: result._id,
          number: 1
        });
      else
        await CommunityClass.changeToArrayCommunity({
          community_id: community,
          type: 'post',
          itemID: result._id,
          number: 1
        });

      // Add notification for all member in community
    }
    HashTagService.createOrUpdateHashTag({ post_id: result._id, scope });

    return result;
  }
  static async getSavedPosts({ user_id, limit = 10, page = 1, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;

    return await PostClass.getSavedPosts({ user_id, limit, skip, sort });
  }

  static async searchPosts({ search, me_id, limit = 10, page = 1, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;

    const isFullSearch = true;

    return await PostClass.searchPosts({
      search,
      me_id,
      limit,
      skip,
      isFullSearch,
      sort
    });
  }
  static async getNormalPostByHashtag({ hashtag, user_id, limit = 10, page = 1, sort = { createdAt: -1 } }) {
    const post_ids = await HashTagService.getNormalPostByHashtag({
      name: '#' + hashtag
    });

    if (!post_ids) return [];
    const posts = await Promise.all(
      post_ids.map(async (post_id) => {
        return await PostClass.findByID({ post_id, user: user_id });
      })
    );
    return posts;
  }
  static async getCommunityPostByHashtag({
    hashtag,
    user_id,
    limit = 10,
    page = 1,
    sort = { createdAt: -1 }
  }) {
    const post_ids = await HashTagService.getCommunityPostByHashtag({
      name: '#' + hashtag
    });

    if (!post_ids) return [];
    const posts = await Promise.all(
      post_ids.map(async (post_id) => {
        return await PostClass.findByID({ post_id, user: user_id });
      })
    );
    return posts;
  }
  static async getQuestionByHashtag({ hashtag, user_id, limit = 10, page = 1, sort = { createdAt: -1 } }) {
    const post_ids = await HashTagService.getQuestionByHashtag({
      name: '#' + hashtag
    });

    // if (!post_ids) return [];
    // const posts = await Promise.all(
    //   post_ids.map(async (post_id) => {
    //     return await PostClass.findByID({ post_id, user: user_id });
    //   })
    // );
    // return posts;
    return post_ids;
  }
}

export default PostService;
