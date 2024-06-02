'use strict';

import { model, Schema, Types } from 'mongoose';
import { unGetSelectData, getSelectData } from '../utils/functions.js';
import {
  avt_default,
  se_UserDefault,
  RoleUser,
  se_UserAdmin
} from '../utils/constants.js';
const ObjectId = Types.ObjectId;
import { UserIncrClass } from './user_incr.model.js';

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'users';

const UserSchema = new Schema(
  {
    id_incr: { type: Number, default: 0, index: true },
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
    password: { type: String },
    role: Array,
    last_online: { type: Date, default: Date.now },

    // ==================================================

    phone_number: Number,
    user_image: { type: String, default: avt_default },
    cover_image: String,
    verified: { type: Boolean, default: false },
    tags: [{ type: String }],
    alias: { type: String, trim: true, default: '' },
    about: String,
    post_series: { type: Array, default: [] },
    /*
      {
        series_id: ObjectId,
        post_id: ObjectId
      }
    */
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
    favorite_questions: {
      type: [{ type: ObjectId, ref: 'Question' }],
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
UserSchema.index({ name: 'text', email: 'text', alias: 'text' });

const UserModel = model(DOCUMENT_NAME, UserSchema);

const getFirstElement = attribute => {
  return {
    $addFields: {
      [attribute]: {
        $arrayElemAt: [`$${attribute}`, 0]
      }
    }
  };
};

class UserClass {
  static async saveQuestion({ user, question_id }) {
    const isSaved = await UserModel.findOne({
      _id: user,
      favorite_questions: question_id
    });

    const operator = isSaved ? '$pull' : '$addToSet';

    return await UserModel.findByIdAndUpdate(
      user,
      {
        [operator]: { favorite_questions: question_id }
      },
      { new: true }
    ).lean();
  }
  static async savePostSeries({ user_id, series_id, post_id }) {
    const isExist = await UserModel.findOne({
      _id: user_id,
      post_series: { $elemMatch: { series_id, post_id } }
    });

    const operator = isExist ? '$pull' : '$push';

    return await UserModel.findByIdAndUpdate(
      user_id,
      {
        [operator]: { post_series: { series_id, post_id } }
      },
      { new: true }
    ).lean();
  }
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
  static async searchUsersByName({ search, me_id, page = 1 }) {
    const limit = 10;
    const skip = (Number.parseInt(page) - 1) * limit;
    const unselect = ['password'];
    const users = await UserModel.aggregate([
      {
        $match: {
          $text: { $search: search }
        }
      },
      {
        $lookup: {
          from: 'friends',
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$id'] },
                    { $in: [new ObjectId(me_id), '$friends'] }
                  ]
                }
              }
            }
          ],
          as: 'friend'
        }
      },
      {
        $addFields: {
          is_friend: {
            $cond: {
              if: { $gt: [{ $size: '$friend' }, 0] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $project: { ...unGetSelectData(unselect), friend: 0 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $sort: { name: 1 }
      }
    ]);
    return users;
  }
  static async getMyInfo({ user_id, select = se_UserDefault }) {
    return await UserModel.findOne({ _id: user_id })
      .select(getSelectData(select))
      .lean();
  }
  static async savePost({ user, post }) {
    // Kiểm tra xem đã lưu bài viết này chưa
    const isSaved = await this.checkExistMany({
      _id: user,
      favorites: { $in: new ObjectId(post) }
    });

    const operant = isSaved.length !== 0 ? '$pull' : '$push';
    const numSave = isSaved.length !== 0 ? -1 : 1;

    await UserModel.findByIdAndUpdate(user, {
      [operant]: { favorites: post }
    }).lean();

    return {
      numSave
    };
  }
  static async updateUser({ email, payload }) {
    return await UserModel.findOneAndUpdate(
      { email },
      { $set: { payload } },
      { new: true }
    ).lean();
  }
  static async updateByID({ user_id, payload }) {
    return await UserModel.findByIdAndUpdate(user_id, payload, {
      new: true
    }).lean();
  }
  static async findById({ user_id, me_id, unselect = ['password'] }) {
    const result = await UserModel.aggregate([
      {
        $match: {
          _id: new ObjectId(user_id)
        }
      },
      {
        $lookup: {
          from: 'friends',
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$id'] },
                    { $in: [new ObjectId(me_id), '$friends'] }
                  ]
                }
              }
            }
          ],
          as: 'friend'
        }
      },
      {
        $addFields: {
          is_friend: {
            $cond: {
              if: { $gt: [{ $size: '$friend' }, 0] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $project: { ...unGetSelectData(unselect), friend: 0 }
      }
    ]);

    return result[0];
  }
  static async findByEmail({ email }) {
    return await UserModel.findOne({ email }).select({
      password: 1,
      email: 1,
      name: 1,
      user_image: 1
    });
  }
  static async findByAlias({ alias }) {
    return await UserModel.findOne({ alias }).select({
      password: 1,
      email: 1,
      name: 1,
      user_image: 1
    });
  }
  static async deleteUser({ user_id }) {
    const user = await UserModel.findByIdAndDelete(user_id).lean();
    await UserIncrClass.pushIdDelete(user.id_incr);
    return true;
  }
  static async createUser({ name, email, password, user_image, alias }) {
    const user = await UserModel.create({
      name,
      email,
      password,
      user_image,
      role: [RoleUser.USER],
      alias
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
    return await UserModel.findOne(select).lean();
  }
  static async checkExistMany(select) {
    return await UserModel.find(select).lean();
  }
  // ================= ADMIN =================
  static deleteUser = async ({ user_id }) => {
    return await UserModel.findByIdAndDelete(user_id).lean();
  };
  static findUserById_admin = async ({ user_id }) => {
    return await UserModel.findById(user_id).lean();
  };
  static getAllUsers_admin = async ({
    limit,
    page,
    sort,
    select = se_UserAdmin
  }) => {
    const skip = (page - 1) * limit;
    return await UserModel.find()
      .limit(limit)
      .skip(skip)
      .select(getSelectData(select))
      .sort(sort)
      .lean();
  };
  static updateUser_admin = async ({ user_id, payload }) => {
    return await UserModel.findByIdAndUpdate(user_id, payload, {
      new: true
    }).lean();
  };
  static deleteUser_admin = async ({ user_id }) => {
    return await UserModel.findByIdAndDelete(user_id).lean();
  };
  static createUser_admin = async ({ name, email, password }) => {
    return await UserModel.create({ name, email, password });
  };
  static getUserNumber_admin = async () => {
    return await UserModel.countDocuments();
  };
}

//Export the model
export { RoleUser, UserClass, UserModel };
