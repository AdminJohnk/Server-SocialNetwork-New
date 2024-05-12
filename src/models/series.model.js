'use strict';

import { model, mongo, Mongoose, Schema, Types } from 'mongoose';
import { pp_UserDefault, pp_UserMore } from '../utils/constants.js';
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
    posts: {
      type: [
        {
          _id: { type: ObjectId, auto: true },
          title: { type: String, required: true },
          description: { type: String, default: '' },
          cover_image: { type: String, required: true },
          content: { type: String, required: true },
          read_time: { type: String, default: '2 minutes' },
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
          visibility: {
            type: String,
            enum: ['public', 'private', 'friend'],
            default: 'public'
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

SeriesSchema.index({ user: 1, posts: 1 }, { unique: true });

const SeriesModel = model(DOCUMENT_NAME, SeriesSchema);

class SeriesClass {
  static async updatePost({
    series_id,
    id,
    title,
    description,
    content,
    cover_image,
    visibility,
    read_time
  }) {
    return await SeriesModel.findOneAndUpdate(
      { _id: series_id, 'posts._id': id },
      {
        $set: {
          'posts.$.title': title,
          'posts.$.description': description,
          'posts.$.content': content,
          'posts.$.cover_image': cover_image,
          'posts.$.visibility': visibility,
          'posts.$.read_time': read_time
        }
      },
      { new: true }
    );
  }
  static async createPost({
    user,
    series_id,
    title,
    description,
    content,
    cover_image,
    visibility,
    read_time
  }) {
    return await SeriesModel.findOneAndUpdate(
      { _id: series_id, user },
      {
        $push: {
          posts: {
            title,
            description,
            content,
            cover_image,
            visibility,
            read_time
          }
        }
      },
      { new: true }
    );
  }
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
  static async getSeriesById({ series_id, user }) {
    return await SeriesModel.findOne({ _id: series_id, user })
      .populate('user', pp_UserMore)
      .populate('posts.comments.user', pp_UserDefault)
      .populate('posts.comments.child.user', pp_UserDefault)
      .populate('posts.likes', pp_UserDefault)
      .populate('posts.saves', pp_UserDefault)
      .populate('reviews.user', pp_UserDefault)
      .lean();
  }
  static async getAllSeries({ user, limit, skip, sort }) {
    return await SeriesModel.find({ user })
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
  }
  static async createSeries({
    user,
    title,
    description,
    introduction,
    level,
    cover_image,
    visibility
  }) {
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
}

//Export the model
export { SeriesClass, SeriesModel };
