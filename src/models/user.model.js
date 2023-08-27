'use strict';

const { model, Schema, default: mongoose } = require('mongoose');

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
    password: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive'
    },
    verify: {
      type: Boolean,
      default: false
    },
    role: {
      type: Array,
      default: []
    },

    // ==================================================

    phoneNumber: {
      type: Number
    },
    userImage: {
      type: String,
      default: null
    },
    coverImage: {
      type: String,
      default: null
    },
    verified: {
      type: String,
      default: false
    },
    tags: {
      type: [{ type: String }],
      default: null
    },
    alias: {
      type: String,
      default: null
    },
    about: {
      type: String,
      default: null
    },
    experiences: {
      type: [
        {
          positionName: String,
          companyName: String,
          startDate: String,
          endDate: String
        }
      ],
      default: null
    },
    repositories: {
      type: [
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
      ],
      default: null
    },
    contacts: {
      type: [{}],
      default: null
    },
    accessToken: {
      type: String,
      default: null
    },
    location: {
      type: String,
      default: null
    },
    followers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: []
    },
    following: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: []
    },
    posts: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
      default: []
    },
    shares: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Share' }],
      default: []
    },
    favorites: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
      default: []
    },
    communities: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
      default: []
    },
    notifications: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

UserSchema.statics = {
  findByEmail: async function ({ email }) {
    return await this.findOne({ email });
  },
  createUser: async function ({ name, email, password }) {
    const user = this.create({
      name,
      email,
      password,
      role: [RoleUser.USER]
    });
    return user;
  }
};

//Export the model
module.exports = model(DOCUMENT_NAME, UserSchema);
