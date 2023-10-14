const { model, Schema, Types } = require('mongoose');

const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Community';
const COLLECTION_NAME = 'communities';

const CommunitySchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    about: {
      type: String,
      required: true
    },
    tags: {
      type: [{ type: String }],
      default: []
    },
    rules: {
      type: [{ title: String, content: String }]
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
    },

    // Number
    post_number: { type: Number, default: 0 },
    member_number: { type: Number, default: 0 },
    admin_number: { type: Number, default: 0 },
    waitlist_user_number: { type: Number, default: 0 },
    waitlist_post_number: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const CommunityModel = model(DOCUMENT_NAME, CommunitySchema);

class CommunityClass {
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
  static async addMemberToCommunity({ community_id, members }) {
    return await CommunityModel.findByIdAndUpdate(
      community_id,
      {
        $addToSet: { members: { $each: members } },
        $inc: { member_number: members.length }
      },
      { new: true }
    ).lean();
  }
  static async acceptJoinRequest({ community_id, user_id }) {
    return await CommunityModel.findByIdAndUpdate(
      community_id,
      {
        $pull: { waitlist_users: user_id },
        $inc: { waitlist_user_number: -1 },

        $addToSet: { members: user_id },
        $inc: { member_number: 1 }
      },
      { new: true }
    ).lean();
  }
  static async joinCommunity({ community_id, user_id }) {
    const community = await CommunityModel.findById(community_id).lean();

    // Member đã là thành viên của community thì xóa đi
    if (
      community.members.findIndex(member => member.toString() === user_id) !==
      -1
    ) {
      return await CommunityModel.findByIdAndUpdate(
        community_id,
        { $pull: { members: user_id }, $inc: { member_number: -1 } },
        { new: true }
      ).lean();
    }
    // Member đã là nằm trong waitlist của community thì xóa đi
    if (
      community.waitlist_users.findIndex(
        member => member.toString() === user_id
      ) !== -1
    ) {
      return await CommunityModel.findByIdAndUpdate(
        community_id,
        {
          $pull: { waitlist_users: user_id },
          $inc: { waitlist_user_number: -1 }
        },
        { new: true }
      ).lean();
    }

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
  static async updateCommunity({ community_id, ...payload }) {
    return await CommunityModel.findByIdAndUpdate(
      community_id,
      { ...payload },
      { new: true }
    ).lean();
  }

  // type = ['member', 'post', 'admin', 'waitlist_user', 'waitlist_post']
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
    return await CommunityModel.findOne(select)
      .select('+admins +waitlist_users +waitlist_posts')
      .lean();
  }
}

module.exports = {
  CommunityModel,
  CommunityClass
};
