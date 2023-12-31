'use strict';

const { Types } = require('mongoose');
const ObjectId = Types.ObjectId;

const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../core/error.response');

const { CommunityClass } = require('../models/community.model');
const { UserClass } = require('../models/user.model');
const { PostClass } = require('../models/post.model');

class CommunityService {
  static async searchMember({ community_id, key_search }) {
    // Check Community
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    return await UserClass.SearchUserInCommunity({ community_id, key_search });
  }
  static async followCommunity({ community_id, user_id }) {
    // Check Community
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    return await CommunityClass.followCommunity({ community_id, user_id });
  }
  static async acceptPost({ community_id, admin_id, post_id }) {
    // Check Community
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    // Check is Admin?
    if (community.admins.findIndex((admin) => admin.toString() === admin_id) === -1)
      throw new ForbiddenError('You are not admin of this community');

    // Check Post
    const post = await PostClass.checkExist({ _id: post_id });
    if (!post) throw new NotFoundError('Post not found');

    // Check Post in wait list?
    if (community.waitlist_posts.findIndex((post) => post.toString() === post_id) === -1)
      throw new NotFoundError('Post not found in wait list');

    return await CommunityClass.acceptPost({ community_id, post_id });
  }
  static deleteMemberFromCommunity = async ({ community_id, admin_id, user_id }) => {
    // Check Community
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    // Check is Admin?
    if (community.admins.findIndex((admin) => admin.toString() === admin_id) === -1)
      throw new ForbiddenError('You are not admin of this community');

    const result = await CommunityClass.deleteMemberFromCommunity({
      community_id,
      user_id
    });

    UserClass.changeToArrayUser({
      user_id,
      type: 'community',
      item_id: community_id,
      number: -1
    });

    return result;
  };
  static addMemberToCommunity = async ({ community_id, admin_id, member_id }) => {
    // Check Community
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    // Check is Admin?
    if (community.admins.findIndex((admin) => admin.toString() === admin_id) === -1)
      throw new ForbiddenError('You are not admin of this community');

    const result = await CommunityClass.addMemberToCommunity({
      community_id,
      member_id
    });

    UserClass.changeToArrayUser({
      user_id: member_id,
      type: 'community',
      item_id: community_id,
      number: 1
    });

    return result;
  };
  static acceptJoinRequest = async ({ community_id, admin_id, user_id }) => {
    // Check Community
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    // Check is Admin?
    if (community.admins.findIndex((admin) => admin.toString() === admin_id) === -1)
      throw new ForbiddenError('You are not admin of this community');

    // Check User in wait list?
    if (community.wait_list.findIndex((user) => user.toString() === user_id) === -1)
      throw new NotFoundError('User not found in wait list');

    const result = await CommunityClass.acceptJoinRequest({
      community_id,
      user_id
    });

    UserClass.changeToArrayUser({
      user_id,
      type: 'community',
      item_id: community_id,
      number: 1
    });

    return result;
  };
  static joinCommunity = async ({ community_id, user_id }) => {
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    const { result, join_number } = await CommunityClass.joinCommunity({
      community_id,
      user_id
    });

    if (join_number === -1) {
      UserClass.changeToArrayUser({
        user_id,
        type: 'community',
        item_id: community_id,
        number: -1
      });
    }

    return result;
  };
  static updateCommunity = async ({
    community_id,
    author,
    name,
    description,
    about,
    tags,
    members,
    admins,
    rules
  }) => {
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    if (community.admins.findIndex((admin) => admin.toString() === author) === -1)
      throw new ForbiddenError('You are not admin of this community');

    const payload = { name, description, about, tags, members, admins, rules };

    return await CommunityClass.updateCommunity({ community_id, ...payload });
  };
  static createCommunity = async ({ author, name, description, about, tags, members, admins, rules }) => {
    if (name === '') throw new BadRequestError('Name is required');
    if (description === '') throw new BadRequestError('Description is required');
    if (about === '') throw new BadRequestError('About is required');
    if (!members.includes(author)) members.push(author);
    if (!admins.includes(author)) admins.push(author);

    const payload = { name, description, about, tags, members, admins, rules };

    return await CommunityClass.createCommunity(payload);
  };
  static async getCommunityByID(community_id) {
    return await CommunityClass.getCommunityByID(community_id);
  }
}

module.exports = CommunityService;
