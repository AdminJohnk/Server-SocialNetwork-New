'use strict';

import { model, Mongoose, Schema, Types } from 'mongoose';
import { pp_UserDefault, pp_UserMore } from '../utils/constants.js';
import { de } from '@faker-js/faker';
const ObjectId = Types.ObjectId;

const DOCUMENT_NAME = 'Series';
const COLLECTION_NAME = 'series';

const SeriesSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    introduction: { type: String, required: true },
    visibility: {
      type: String,
      enum: ['public', 'private', 'friend'],
      default: 'public'
    },
    post: {
      type: [
        {
          title: { type: String, required: true },
          content: { type: String, required: true },
          cover_image: { type: String, required: true },
          description: { type: String, default: '' },
          read_time: { type: Number, default: 0 },
          likes: {
            type: [{ type: ObjectId, ref: 'User' }]
          },
          saves: {
            type: [{ type: ObjectId, ref: 'User' }]
          },
          comments: {
            type: [
              {
                _id: ObjectId,
                user: { type: ObjectId, ref: 'User' },
                content: String,
                like: {
                  type: [{ type: ObjectId, ref: 'User' }]
                },
                createdAt: { type: Date, default: Date.now },
                child: [
                  {
                    _id: ObjectId,
                    user: { type: ObjectId, ref: 'User' },
                    content: String,
                    like_number: { type: Number, default: 0 },
                    createdAt: { type: Date, default: Date.now }
                  }
                ]
              }
            ]
          },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    cover_image: { type: String, default: '' },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    rating: {
      type: {
        start_1: { type: Number, default: 0 },
        start_2: { type: Number, default: 0 },
        start_3: { type: Number, default: 0 },
        start_4: { type: Number, default: 0 },
        start_5: { type: Number, default: 0 },
        avg: { type: Number, default: 0 }
      }
    },
    reviews: {
      type: [
        {
          user: { type: ObjectId, ref: 'User' },
          content: { type: String, required: true },
          rating: { type: Number, required: true },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

SeriesSchema.index({ user: 1, post: 1 }, { unique: true });

const SeriesModel = model(DOCUMENT_NAME, SeriesSchema);

class SeriesClass {
  static async updateSeries({
    series_id,
    user,
    title,
    description,
    introduction,
    level,
    cover_image,
    visibility
  }) {
    return await SeriesModel.findOneAndUpdate(
      { _id: series_id, user },
      {
        title,
        description,
        introduction,
        level,
        cover_image,
        visibility
      },
      { new: true }
    );
  }
  static async getSeriesById({ series_id }) {
    return await SeriesModel.findById(series_id)
      .populate('user', pp_UserMore)
      .populate('post.comments.user', pp_UserDefault)
      .populate('post.comments.child.user', pp_UserDefault)
      .populate('post.likes', pp_UserDefault)
      .populate('post.saves', pp_UserDefault)
      .populate('reviews.user', pp_UserDefault)
      .lean();
  }
  static async getAllSeries({ user, limit, skip, sort }) {
    return await SeriesModel.find({ user }).skip(skip).limit(limit).sort(sort).lean();
  }
  static async createSeries({ user, title, description, introduction, level, cover_image, visibility }) {
    return await SeriesModel.create({
      user,
      title,
      description,
      introduction,
      level,
      cover_image,
      visibility
    });
  }

  static async checkExist(select) {
    return await SeriesModel.findOne(select).lean();
  }

  //   static async getAllUserLikePost({ post, owner_post, limit, skip, sort }) {
  //     return await LikeModel.find({ post, owner_post })
  //       .populate('user', pp_UserDefault)
  //       .select('user')
  //       .skip(skip)
  //       .limit(limit)
  //       .sort(sort)
  //       .lean();
  //   }
  //   static async likePost({ user, post, owner_post }) {
  //     const foundLike = await LikeModel.findOne({
  //       user: user,
  //       post: post
  //     });
  //     let numLike = 1;
  //     if (foundLike) {
  //       await Promise.resolve(LikeModel.deleteOne(foundLike));
  //       numLike = -1;
  //     } else await LikeModel.create({ user, post, owner_post });
  //     return {
  //       numLike
  //     };
  //   }
  //   static async checkExist(select) {
  //     return await LikeModel.findOne(select).lean();
  //   }
}

//Export the model
export { SeriesClass, SeriesModel };
