'use strict';

const { model, Schema, Types } = require('mongoose');
const { unGetSelectData, getSelectData } = require('../utils/functions');
const { avt_default, se_UserDefault, RoleUser } = require('../utils/constants');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'users';

var UserSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150,
      required: true
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true
    },
    password: { type: String, required: true },
    role: Array,

    // ==================================================

    phone_number: Number,
    user_image: { type: String, default: avt_default },
    cover_image: String,
    verified: { type: Boolean, default: false },
    tags: [{ type: String }],
    alias: String,
    about: String,
    experiences: { type: Array, default: [] },
    /* 
      {
        positionName: String,
        companyName: String,
        startDate: String,
        endDate: String
      }
    */
    repositories: { type: Array, default: [] },
    /* 
    {
        id: Number,
        name: String,
        private: Boolean,
        url: String,
        watchersCount: Number,
        forksCount: Number,
        stargazersCount: Number,
        languages: String
      }
    */
    contacts: { type: Array, default: [] },
    location: String,
    favorites: {
      type: [{ type: ObjectId, ref: 'Post' }],
      default: []
    },
    favorite_number: { type: Number, default: 0 },
    communities: {
      type: [{ type: ObjectId, ref: 'Community' }],
      default: []
    },
    notifications: {
      type: [{ type: ObjectId, ref: 'Notification' }],
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

const UserModel = model(DOCUMENT_NAME, UserSchema);

class UserClass {
  static async getMyInfo({ user_id, select = se_UserDefault }) {
    return await UserModel.findOne({ _id: user_id }).select(
      getSelectData(select)
    );
  }
  static async savePost({ user, post }) {
    // Kiểm tra xem đã lưu bài viết này chưa
    const isSaved = await this.checkExist({
      _id: user,
      favorites: { $elemMatch: { $eq: post } }
    });

    const operant = isSaved ? '$pull' : '$addToSet';
    const share_number = isSaved ? -1 : 1;

    await UserModel.findByIdAndUpdate(
      user,
      {
        [operant]: { favorites: post }
      },
      { new: true }
    );

    return {
      share_number
    }
  }
  static async updateTags({ user_id, tags }) {
    return await UserModel.findByIdAndUpdate(
      user_id,
      { $set: { tags: tags } },
      { new: true }
    ).lean();
  }
  static async getShouldFollow({ user_id }) {}
  static async updateByID({ user_id, payload }) {
    return await UserModel.findByIdAndUpdate(user_id, payload, {
      new: true
    }).lean();
  }
  static async checkExist(select) {
    try {
      return await UserModel.findOne(select);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  static async findById({ user_id, unselect = ['password'] }) {
    return await UserModel.findOne({ _id: user_id }).select(
      unGetSelectData(unselect)
    );
  }
  static async findByEmail({ email }) {
    return await UserModel.findOne({ email }).select({ password: 1 }).lean();
  }
  static async createUser({ name, email, password }) {
    const user = UserModel.create({
      name,
      email,
      password,
      role: [RoleUser.USER]
    });
    return user;
  }
}

//Export the model
module.exports = {
  RoleUser,
  UserClass,
  UserModel
};
