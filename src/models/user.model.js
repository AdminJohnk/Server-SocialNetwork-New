'use strict';

const { model, Schema, Types } = require('mongoose');
const { unGetSelectData, getSelectData } = require('../utils/functions');
const { avt_default, se_UserDefault, RoleUser } = require('../utils/constants');
const ObjectId = Types.ObjectId;
const { UserIncrClass } = require('./user_incr.model');

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'users';

const UserSchema = new Schema(
  {
    id_incr: { type: Number, default: 0 },
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
    alias: { type: String, unique: true, trim: true, default: '' },
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
    communities: {
      type: [{ type: ObjectId, ref: 'Community' }],
      default: []
    },
    notifications: {
      type: [{ type: ObjectId, ref: 'Notification' }],
      default: []
    },

    // Number
    follower_number: { type: Number, default: 0 },
    following_number: { type: Number, default: 0 },
    post_number: { type: Number, default: 0 },
    community_number: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

// Xóa trường _id và thay thế bằng id khi dùng find, findOne, ... trả về
// UserSchema.set('toJSON', {
//   virtuals: true,
//   transform: function (doc, ret) {
//     delete ret._id;
//     delete ret.__v;
//   }
// });

UserSchema.pre('save', async function (next) {
  const userIncr = await UserIncrClass.getIdCurrent();
  if (userIncr.id_delete.length) {
    this.id_incr = userIncr.id_delete.at(-1);
    await UserIncrClass.pullIdDelete();
  } else {
    this.id_incr = userIncr.id_current + 1;
    await UserIncrClass.setIncrId(this.id_incr);
  }

  next();
});

// create index for search
UserSchema.index({ name: 'text', email: 'text' });

const UserModel = model(DOCUMENT_NAME, UserSchema);

// attribute = ['_id'] --> check me_id is followed user_id
const checkIsFollowed = (me_id, attribute) => {
  return {
    $lookup: {
      from: 'follows',
      let: { temp: `$${attribute}` },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$user', new ObjectId(me_id)] },
                { $in: ['$$temp', '$followings'] }
              ]
            }
          }
        }
      ],
      as: 'is_followed'
    }
  };
};
const trueFalseFollowed = () => {
  return {
    $addFields: {
      is_followed: {
        $cond: {
          if: {
            $eq: [{ $size: `$is_followed` }, 0]
          },
          then: false, // Nếu mảng rỗng, tức là không theo dõi, set thành false
          else: true // Ngược lại, tức là đang theo dõi, set thành true
        }
      }
    }
  };
};

class UserClass {
  static async SearchUserInCommunity({ community_id, key_search }) {
    const regexSearch = new RegExp(key_search, 'i');

    const result = await UserModel.find(
      {
        communities: { $in: [community_id] },
        $text: { $search: regexSearch }
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .select(getSelectData(se_UserDefault))
      .lean();

    return result;
  }
  static async getMyInfo({ user_id, select = se_UserDefault }) {
    return await UserModel.findOne({ _id: user_id })
      .select(getSelectData(select))
      .lean();
  }
  static async savePost({ user, post }) {
    // Kiểm tra xem đã lưu bài viết này chưa
    const isSaved = await this.checkExist({
      _id: user,
      favorites: { $elemMatch: { $eq: post } }
    });

    const operant = isSaved ? '$pull' : '$addToSet';
    const numSave = isSaved ? -1 : 1;

    await UserModel.findByIdAndUpdate(
      user,
      {
        [operant]: { favorites: post }
      },
      { new: true }
    );

    return {
      numSave
    };
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
  static async findById({ user_id, me_id, unselect = ['password'] }) {
    // check if me_id followed user_id
    const result = await UserModel.aggregate([
      {
        $match: {
          _id: new ObjectId(user_id)
        }
      },
      checkIsFollowed(me_id, '_id'),
      trueFalseFollowed()
    ]);
    return result[0];
  }
  static async findByEmail({ email }) {
    return await UserModel.findOne({ email }).select({ password: 1 }).lean();
  }
  static async deleteUser({ user_id }) {
    const user = await UserModel.findByIdAndDelete(user_id).lean();
    await UserIncrClass.pushIdDelete(user.id_incr);
    return true;
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
  // type = ['community']
  // number = 1 or -1
  static async changeToArrayUser({ user_id, type, item_id, number }) {
    let stringUpdateArr = type + 's';
    let stringUpdateNum = type + '_number';
    let operator = number === 1 ? '$addToSet' : '$pull';

    if (type === 'community') {
      stringUpdateArr = 'communities';
      stringUpdateNum = 'community_number';
    }

    return await UserModel.findByIdAndUpdate(
      user_id,
      {
        [operator]: { [stringUpdateArr]: item_id },
        $inc: { [stringUpdateNum]: number }
      },
      { new: true }
    ).lean();
  }
  // type = ['follower', 'following', 'post']
  static async changeNumberUser({ user_id, type, number }) {
    let stringUpdate = type + '_number';
    return await UserModel.findByIdAndUpdate(
      user_id,
      {
        $inc: {
          [stringUpdate]: number
        }
      },
      { new: true }
    ).lean();
  }
  static async checkExist(select) {
    return await UserModel.find(select).lean();
  }
}

//Export the model
module.exports = {
  RoleUser,
  UserClass,
  UserModel
};
