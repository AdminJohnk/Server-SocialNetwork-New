'use strict';

import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;

import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../core/error.response.js';

import { CommunityClass } from '../models/community.model.js';
import { UserClass } from '../models/user.model.js';
import { PostClass } from '../models/post.model.js';
import { removeFalsyFields, updateNestedObjectParser } from '../utils/functions.js';

class CommunityService {

  static async getAllCommunities() {
    return await CommunityClass.getAllCommunities();
  }

  static async cedeCreator({ community_id, me_id, new_creator_id }) {
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    if (community.creator.toString() !== me_id)
      throw new ForbiddenError('You are not creator of this community');

    if (community.members.findIndex((member) => member.toString() === new_creator_id) === -1)
      throw new NotFoundError('User not found in community');

    return await CommunityClass.cedeCreator({ community_id, new_creator_id });
  }
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
  static async rejectPost({ community_id, admin_id, post_id }) {
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

    return await CommunityClass.rejectPost({ community_id, post_id });
  }
  static deleteMemberFromCommunity = async ({ community_id, admin_id, user_id }) => {
    // Check Community
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    // Check is Admin?
    if (community.admins.findIndex((admin) => admin.toString() === admin_id) === -1)
      throw new ForbiddenError('You are not admin of this community');

    // Check User in members list?
    if (community.members.findIndex((member) => member.toString() === user_id) === -1)
      throw new NotFoundError('User not found in community');

    // Check User is Admin?
    if (community.admins.findIndex((admin) => admin.toString() === user_id) !== -1) {
      // Check admin is creator?
      if (community.creator.toString() === admin_id) {
        await CommunityClass.revokeAdmin({ community_id, admin_id: user_id });
      }
    }

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
  static addMemberToCommunity = async ({ community_id, admin_id, member_ids }) => {
    // Check Community
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    // Check is Admin?
    if (community.admins.findIndex((admin) => admin.toString() === admin_id) === -1)
      throw new ForbiddenError('You are not admin of this community');

    // Remove member is exist in members list
    member_ids = member_ids.filter(
      (member_id) => community.members.findIndex((member) => member.toString() === member_id) === -1
    );

    const result = await CommunityClass.addMemberToCommunity({
      community_id,
      member_ids
    });

    member_ids.map((member_id) => {
      UserClass.changeToArrayUser({
        user_id: member_id,
        type: 'community',
        item_id: community_id,
        number: 1
      });
    });

    return result;
  };
  static acceptJoinRequest = async ({ community_id, admin_id, user_ids }) => {
    // Check Community
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    // Check is Admin?
    if (community.admins.findIndex((admin) => admin.toString() === admin_id) === -1)
      throw new ForbiddenError('You are not admin of this community');

    // Remove user is exist in members list
    user_ids = user_ids.filter(
      (user_id) => community.members.findIndex((member) => member.toString() === user_id) === -1
    );
    if (user_ids.length === 0) throw new ConflictRequestError('User is already member of this community');

    // Check User in wait list?
    user_ids = user_ids.filter(
      (user_id) => community.waitlist_users.findIndex((user) => user.toString() === user_id) !== -1
    );
    if (user_ids.length === 0) throw new NotFoundError('User not found in wait list');

    const result = await CommunityClass.acceptJoinRequest({
      community_id,
      user_ids
    });

    user_ids.map((user_id) => {
      UserClass.changeToArrayUser({
        user_id,
        type: 'community',
        item_id: community_id,
        number: 1
      });
    });

    return result;
  };
  static rejectJoinRequest = async ({ community_id, admin_id, user_ids }) => {
    // Check Community
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    // Check is Admin?
    if (community.admins.findIndex((admin) => admin.toString() === admin_id) === -1)
      throw new ForbiddenError('You are not admin of this community');

    // Check User in wait list?
    user_ids = user_ids.filter(
      (user_id) => community.waitlist_users.findIndex((user) => user.toString() === user_id) !== -1
    );
    if (user_ids.length === 0) throw new NotFoundError('User not found in wait list');

    return await CommunityClass.rejectJoinRequest({
      community_id,
      user_ids
    });
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

  static async cancelJoinCommunity({ community_id, user_id }) {
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    if (community.waitlist_users.findIndex((member) => member.toString() === user_id) === -1)
      throw new NotFoundError('User is not in wait list of this community');

    return await CommunityClass.cancelJoinCommunity({ community_id, user_id });
  }

  static async leaveCommunity({ community_id, user_id }) {
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    if (community.members.findIndex((member) => member.toString() === user_id) === -1)
      throw new NotFoundError('User is not member of this community');

    if (community.creator.toString() === user_id)
      throw new ConflictRequestError('You are creator of this community');

    const result = await CommunityClass.leaveCommunity({
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
  }

  static async promoteAdmin({ community_id, me_id, admin_id }) {
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    if (community.creator.toString().includes(me_id) === -1)
      throw new ForbiddenError('You are not creator of this community');

    if (community.members.findIndex((member) => member.toString() === admin_id) === -1)
      throw new NotFoundError('User not found in community');

    if (community.admins.findIndex((admin) => admin.toString() === admin_id) !== -1)
      throw new ConflictRequestError('User is already admin of this community');

    return await CommunityClass.promoteAdmin({ community_id, admin_id });
  }

  static async revokeAdmin({ community_id, me_id, admin_id }) {
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    if (community.creator.toString().includes(me_id) === -1)
      throw new ForbiddenError('You are not creator of this community');

    if (community.admins.findIndex((admin) => admin.toString() === admin_id) === -1)
      throw new NotFoundError('User is not admin of this community');

    return await CommunityClass.revokeAdmin({ community_id, admin_id });
  }

  static updateCommunity = async ({
    community_id,
    author,
    name,
    about,
    tags,
    members,
    admins,
    rules,
    image
  }) => {
    const community = await CommunityClass.checkExist({ _id: community_id });
    if (!community) throw new NotFoundError('Community not found');

    if (community.creator.toString() !== author)
      throw new ForbiddenError('You are not creator of this community');

    const payload = updateNestedObjectParser(removeFalsyFields({
      name,
      about,
      tags,
      members: [...new Set(members)],
      admins: [...new Set(admins)],
      rules,
      image
    }));

    return await CommunityClass.updateCommunity({ community_id, ...payload });
  };
  static createCommunity = async ({ author, name, about, tags, members = [], admins = [], rules, image }) => {
    if (!name) throw new BadRequestError('Name is required');
    if (!about) throw new BadRequestError('About is required');
    if (!members.includes(author)) members.push(author);
    if (!admins.includes(author)) admins.push(author);

    const payload = { name, about, tags, members, admins, rules, creator: author, image };

    return await CommunityClass.createCommunity(payload);
  };
  static async getCommunityByID(community_id) {
    return await CommunityClass.getCommunityByID(community_id);
  }
  static async getCommunitiesByUserID(user_id) {
    return await CommunityClass.getCommunitiesByUserID(user_id);
  }
  static async getAllImagesByCommunityID(community_id) {
    return await CommunityClass.getAllImagesByCommunityID(community_id);
  }
  static async getAllCommunitiesYouManage({ user_id, page }) {
    return await CommunityClass.getAllCommunitiesYouManage(user_id, page);
  }
  static async getPostByID({ community_id, post_id }) {
    return await CommunityClass.getPostByID({ community_id, post_id });
  }
  static async getPostsByCommunityID({ community_id, page }) {
    return await CommunityClass.getPostsByCommunityID({ community_id, page });
  }
}

export default CommunityService;
