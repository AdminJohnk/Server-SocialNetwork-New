import { model, Schema, Types } from 'mongoose';
import { se_UserDefault, pp_UserDefault } from '../utils/constants.js';
import { getSelectData } from '../utils/functions.js';
import { PostClass } from './post.model.js';

const ObjectId = Schema.Types.ObjectId;

const DOCUMENT_NAME = 'Community';
const COLLECTION_NAME = 'communities';

const CommunitySchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    creator: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    image: {
      type: String,
      required: true
    },
    about: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      default: []
    },
    rules: {
      type: [{ title: String, content: String }]
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'member', 'friend'],
      default: 'public'
    },

    // =========================================

    posts: {
      type: [{ type: ObjectId, ref: 'Post' }],
      default: []
    },
    members: {
      type: [{ type: ObjectId, ref: 'User' }],
      required: true
    },
    recently_joined: {
      type: [{ type: ObjectId, ref: 'User' }],
      default: []
    },
    admins: {
      type: [{ type: ObjectId, ref: 'User' }],
      required: true,
      select: false
    },
    waitlist_users: {
      type: [{ type: ObjectId, ref: 'User' }],
      default: [],
      select: false
    },
    waitlist_posts: {
      type: [{ type: ObjectId, ref: 'Post' }],
      default: [],
      select: false
    }

    // Number
    // post_number: { type: Number, default: 0 },
    // member_number: { type: Number, default: 0 },
    // admin_number: { type: Number, default: 0 },
    // waitlist_user_number: { type: Number, default: 0 },
    // waitlist_post_number: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const CommunityModel = model(DOCUMENT_NAME, CommunitySchema);

class CommunityClass {
  static async cedeCreator({ community_id, new_creator_id }) {
    return await CommunityModel.findByIdAndUpdate(
      community_id,
      { creator: new_creator_id, $addToSet: { admins: new_creator_id } },
      { new: true }
    ).lean();
  }
  static async acceptPost({ community_id, post_id }) {
    return await CommunityModel.findByIdAndUpdate(
      community_id,
      {
        $pull: { waitlist_posts: post_id },
        $addToSet: { posts: post_id },
        $inc: { post_number: 1, waitlist_post_number: -1 }
      },
      { new: true }
    ).lean();
  }
  static async rejectPost({ community_id, post_id }) {
    PostClass.deletePost({ post_id });
    return await CommunityModel.findByIdAndUpdate(
      community_id,
      {
        $pull: { waitlist_posts: post_id },
        $inc: { waitlist_post_number: -1 }
      },
      { new: true }
    ).lean();
  }
  static async deleteMemberFromCommunity({ community_id, user_id }) {
    return await CommunityModel.findByIdAndUpdate(
      community_id,
      {
        $pull: { members: user_id },
        $inc: { member_number: -1 }
      },
      { new: true }
    ).lean();
  }
  static async addMemberToCommunity({ community_id, member_ids }) {
    return await CommunityModel.findByIdAndUpdate(
      community_id,
      {
        $addToSet: { members: member_ids }
      },
      { new: true }
    ).lean();
  }
  static async acceptJoinRequest({ community_id, user_ids }) {
    return await CommunityModel.findByIdAndUpdate(community_id, {
      $pull: { waitlist_users: { $in: user_ids } },

      $addToSet: { members: user_ids }
    }).lean();
  }

  static async rejectJoinRequest({ community_id, user_ids }) {
    return await CommunityModel.findByIdAndUpdate(community_id, {
      $pull: { waitlist_users: { $in: user_ids } }
    }).lean();
  }

  static async joinCommunity({ community_id, user_id }) {
    // Member chưa là thành viên của community thì thêm vào waitlist
    return await CommunityModel.findByIdAndUpdate(
      community_id,
      {
        $addToSet: { waitlist_users: user_id },
        $inc: { waitlist_user_number: 1 }
      },
      { new: true }
    ).lean();
  }

  static async cancelJoinCommunity({ community_id, user_id }) {
    return await CommunityModel.findByIdAndUpdate(community_id, {
      $pull: { waitlist_users: user_id }
    }).lean();
  }

  static async leaveCommunity({ community_id, user_id }) {
    return await CommunityModel.findByIdAndUpdate(
      community_id,
      {
        $pull: { members: user_id, admins: user_id },
        $inc: { member_number: -1 }
      },
      { new: true }
    ).lean();
  }

  static async promoteAdmin({ community_id, admin_id }) {
    return await CommunityModel.findByIdAndUpdate(community_id, {
      $addToSet: { admins: admin_id }
    }).lean();
  }

  static async revokeAdmin({ community_id, admin_id }) {
    return await CommunityModel.findByIdAndUpdate(community_id, {
      $pull: { admins: admin_id }
    }).lean();
  }

  static async updateCommunity({ community_id, ...payload }) {
    return await CommunityModel.findByIdAndUpdate(community_id, { ...payload }, { new: true }).lean();
  }

  // type = ['member', 'post', 'follow', 'admin', 'waitlist_user', 'waitlist_post']
  // number = 1 or -1
  static async changeToArrayCommunity({ community_id, type, itemID, number }) {
    let stringUpdateArr = type + 's';
    let stringUpdateNum = type + '_number';
    let operator = number === 1 ? '$addToSet' : '$pull';

    return await CommunityModel.findByIdAndUpdate(
      community_id,
      {
        [operator]: { [stringUpdateArr]: itemID },
        $inc: { [stringUpdateNum]: number }
      },
      { new: true }
    ).lean();
  }
  
  // payload: { name,description, about, tags, members, admins, rules }
  static async createCommunity(payload) {
    return await CommunityModel.create(payload);
  }
  static async checkExist(select) {
    return await CommunityModel.findOne(select).select('+admins +waitlist_users +waitlist_posts').lean();
  }
  static async getCommunityByID(community_id) {
    return await CommunityModel.findById(community_id)
      .select('+admins +waitlist_users +waitlist_posts')
      .populate('creator', getSelectData(se_UserDefault))
      .populate('members')
      .populate('recently_joined')
      .populate('admins')
      .populate('waitlist_users')
      .populate({
        path: 'waitlist_posts',
        populate: {
          path: 'post_attributes',
          populate: [
            { path: 'user', select: pp_UserDefault },
            { path: 'owner_post', select: pp_UserDefault },
            { path: 'post' }
          ]
        }
      })
      .lean();
  }
  static async getCommunitiesByUserID(user_id) {
    return await CommunityModel.find({ members: user_id })
      .select('+admins +waitlist_users +waitlist_posts')
      .populate('creator', getSelectData(se_UserDefault))
      .populate('members')
      .populate('recently_joined')
      .populate('admins')
      .populate('waitlist_users')
      .populate({
        path: 'waitlist_posts',
        populate: {
          path: 'post_attributes',
          populate: [
            { path: 'user', select: pp_UserDefault },
            { path: 'owner_post', select: pp_UserDefault },
            { path: 'post' }
          ]
        }
      })
      .lean();
  }
  static async getAllImagesByCommunityID(community_id) {
    const community = await CommunityModel.findById(community_id).populate('posts').lean();

    return community.posts.map((post) => post.post_attributes.images).flat();
  }
  static async getAllCommunitiesYouManage(user_id, page) {
    const limit = 9;
    const skip = (parseInt(page) - 1) * limit;

    return await CommunityModel.find({ admins: user_id })
      .select('+admins +waitlist_users +waitlist_posts')
      .populate('creator', getSelectData(se_UserDefault))
      .populate('members')
      .populate('recently_joined')
      .populate('admins')
      .populate('waitlist_users')
      .populate({
        path: 'waitlist_posts',
        populate: {
          path: 'post_attributes',
          populate: [
            { path: 'user', select: pp_UserDefault },
            { path: 'owner_post', select: pp_UserDefault },
            { path: 'post' }
          ]
        }
      })
      .skip(skip)
      .limit(limit)
      .lean();
  }
  static async getPostByID({ community_id, post_id }) {
    const community = await CommunityModel.findById(community_id)
      .populate({
        match: { _id: post_id },
        path: 'posts',
        populate: {
          path: 'post_attributes',
          populate: [
            { path: 'user', select: pp_UserDefault },
            { path: 'owner_post', select: pp_UserDefault },
            { path: 'post' }
          ]
        }
      })
      .lean();

    return community.posts[0];
  }
  static async getPostsByCommunityID({ community_id, page }) {
    const limit = 5;
    const skip = (parseInt(page) - 1) * limit;

    const community = await CommunityModel.findById(community_id)
      .populate({
        path: 'posts',
        populate: {
          path: 'post_attributes',
          populate: [
            { path: 'user', select: pp_UserDefault },
            { path: 'owner_post', select: pp_UserDefault },
            { path: 'post' }
          ]
        }
      })
      .skip(skip)
      .limit(limit)
      .lean();

    return community.posts;
  }
}

export { CommunityModel, CommunityClass };
