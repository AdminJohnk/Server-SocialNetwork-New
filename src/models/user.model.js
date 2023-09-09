'use strict';

const { model, Schema, Types } = require('mongoose');
const { unGetSelectData } = require('../utils');
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'users';

const RoleUser = {
  USER: '0000',
  WRITER: '0001',
  EDITOR: '0002'
};

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
    password: { type: String, required: true, select: false },
    role: Array,

    // ==================================================

    phone_number: Number,
    user_image: String,
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
    followers: {
      type: [{ type: ObjectId, ref: 'User' }],
      default: []
    },
    following: {
      type: [{ type: ObjectId, ref: 'User' }],
      default: []
    },
    posts: {
      type: [{ type: ObjectId, ref: 'Post' }],
      default: []
    },
    shares: {
      type: [{ type: ObjectId, ref: 'Share' }],
      default: []
    },
    favorites: {
      type: [{ type: ObjectId, ref: 'Post' }],
      default: []
    },
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
  static async updateTags({ user_id, tags }) {
    return await UserModel.findByIdAndUpdate(
      user_id,
      {
        $set: {
          tags: tags
        }
      },
      {
        new: true
      }
    ).lean();
  }
  static async getShouldFollow({ user_id }) {}
  static async updateByID({ user_id, payload }) {
    return await UserModel.findByIdAndUpdate(user_id, payload, {
      new: true
    }).lean();
  }
  static async findByID({ user_id, unSelect = ['__v'] }) {
    return await UserModel.findOne({ _id: user_id })
      .select(unGetSelectData(unSelect))
      .lean();
  }
  static async findByEmail({ email }) {
    return await UserModel.findOne({ email }).lean();
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
  UserClass,
  UserModel
};
