'use strict';

import { model, Schema, Types } from 'mongoose';
import { unGetSelectData, getSelectData } from '../utils/functions.js';
import { avt_default, se_UserDefault, RoleUser, se_UserAdmin } from '../utils/constants.js';
const ObjectId = Types.ObjectId;
import { UserIncrClass } from './user_incr.model.js';
import { populate } from 'dotenv';
import path from 'path';

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
    reputation: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

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
    category_favorite_questions: {
      type: [
        {
          name: String,
          questions: [{ type: ObjectId, ref: 'Question' }]
        }
      ],
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

// lv1   0
// lv2   50
// lv3   150
// lv4   250
// lv5   400

// comment: 0.5
// answer: 1
// vote comment: 1
// vote answer: 1.5
// vote question: 2

const UserModel = model(DOCUMENT_NAME, UserSchema);
class UserClass {
  static async moveToListQuestion({ user, question_id, from, to }) {
    await UserModel.findOneAndUpdate(
      { _id: user, 'category_favorite_questions.name': from },
      {
        $pull: {
          'category_favorite_questions.$.questions': new ObjectId(question_id)
        }
      }
    ).lean();

    await UserModel.findOneAndUpdate(
      { _id: user, 'category_favorite_questions.name': to },
      {
        $addToSet: {
          'category_favorite_questions.$.questions': new ObjectId(question_id)
        }
      }
    ).lean();

    return true;
  }
  static async getAllListQuestion({ user }) {
    const list_category = await UserModel.findById(user)
      .select({ _id: 0, category_favorite_questions: 1 })
      .populate({
        path: 'category_favorite_questions',
        populate: [
          {
            path: 'questions',
            select: {
              _id: 1,
              title: 1,
              problem: 1,
              hashtags: 1,
              text: 1,
              user: 1,
              vote_score: 1,
              view: 1,
              answers: 1,
              createdAt: 1
            },
            populate: {
              path: 'user',
              select: { _id: 1, name: 1, user_image: 1 }
            }
          }
        ]
      })
      .lean();

    const list_name = list_category.category_favorite_questions.map((item) => item.name);

    return {
      list_name,
      list_category: list_category.category_favorite_questions
    };
  }
  static async createListQuestion({ user, name }) {
    return await UserModel.findByIdAndUpdate(user, {
      $push: {
        category_favorite_questions: { name, questions: [] }
      }
    }).lean();
  }
  static async changeReputation({ user_id, number }) {
    const user = await UserModel.findById(user_id).lean();
    const newReputation = user.reputation + number;
    let newLevel = user.level;
    if (newReputation >= 400) {
      newLevel = 5;
    } else if (newReputation >= 250) {
      newLevel = 4;
    } else if (newReputation >= 150) {
      newLevel = 3;
    } else if (newReputation >= 50) {
      newLevel = 2;
    } else {
      newLevel = 1;
    }
    await UserModel.findByIdAndUpdate(
      user_id,
      {
        $inc: { reputation: number },
        level: newLevel
      },
      { new: true }
    ).lean();

    return true;
  }
  static async getReputation({ user_id }) {
    return await UserModel.findById(user_id).select({ reputation: 1, level: 1 }).lean();
  }
  static async getSavedQuestions({ user }) {
    const result = await UserModel.aggregate([
      { $match: { _id: new ObjectId(user) } },
      {
        $lookup: {
          from: 'questions',
          let: { favoriteQuestions: '$favorite_questions' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$favoriteQuestions'] } } },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user_arr'
              }
            },
            {
              $addFields: {
                user: { $arrayElemAt: ['$user_arr', 0] }
              }
            },
            { $project: { user_arr: 0 } }
          ],
          as: 'favorite_questions_arr'
        }
      },
      {
        $addFields: {
          favorite_questions: {
            $map: {
              input: '$favorite_questions',
              as: 'q_id',
              in: {
                $first: {
                  $filter: {
                    input: '$favorite_questions_arr',
                    as: 'fq',
                    cond: { $eq: ['$$fq._id', '$$q_id'] }
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          favorite_questions: {
            _id: 1,
            title: 1,
            problem: 1,
            hashtags: 1,
            text: 1,
            user: { _id: 1, name: 1, user_image: 1 },
            vote_score: 1,
            view: 1,
            answer_number: { $size: '$favorite_questions.answers' },
            createdAt: 1
          }
        }
      }
    ]);

    return result[0].favorite_questions.reverse();
  }
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
  static async getAllUsers({ me_id }) {
    return await UserModel.find({ _id: { $ne: me_id } }).lean();
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
                  $and: [{ $eq: ['$user', '$$id'] }, { $in: [new ObjectId(me_id), '$friends'] }]
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
    return await UserModel.findOne({ _id: user_id }).select(getSelectData(select)).lean();
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
    return await UserModel.findOneAndUpdate({ email }, { $set: { payload } }, { new: true }).lean();
  }
  static async updateByID({ user_id, payload }) {
    return await UserModel.findByIdAndUpdate(user_id, payload, {
      new: true
    }).lean();
  }
  static async findById({
    user_id,
    me_id,
    unselect = ['password', 'favorites', 'favorite_questions', 'post_series', 'notifications', 'communities']
  }) {
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
                  $and: [{ $eq: ['$user', '$$id'] }, { $in: [new ObjectId(me_id), '$friends'] }]
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
  static getAllUsers_admin = async ({ limit, page, sort, select = se_UserAdmin }) => {
    const skip = (page - 1) * limit;
    return await UserModel.find().limit(limit).skip(skip).select(getSelectData(select)).sort(sort).lean();
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
