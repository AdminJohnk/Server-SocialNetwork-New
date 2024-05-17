'use strict';

import { model, mongo, Mongoose, Schema, Types } from 'mongoose';
import { pp_UserDefault, pp_UserMore } from '../utils/constants.js';
import { FriendClass } from './friend.model.js';
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
    posts: {
      type: [
        {
          title: { type: String, required: true },
          description: { type: String, default: '' },
          cover_image: { type: String, required: true },
          content: { type: String, required: true },
          read_time: { type: Number, default: 2 },
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
                child: [
                  {
                    _id: ObjectId,
                    user: { type: ObjectId, ref: 'User' },
                    content: String,
                    like_number: { type: Number, default: 0 },
                    createdAt: { type: Date, default: Date.now }
                  }
                ],
                like: {
                  type: [{ type: ObjectId, ref: 'User' }]
                },
                createdAt: { type: Date, default: Date.now }
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
        star_1: { type: Number },
        star_2: { type: Number },
        star_3: { type: Number },
        star_4: { type: Number },
        star_5: { type: Number },
        avg: { type: Number }
      },
      default: {
        star_1: 0,
        star_2: 0,
        star_3: 0,
        star_4: 0,
        star_5: 0,
        avg: 0
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

SeriesSchema.index({ _id: 1, 'posts._id': 1 }, { unique: true });
SeriesSchema.index({ _id: 1, user: 1 }, { unique: true });

const SeriesModel = model(DOCUMENT_NAME, SeriesSchema);

class SeriesClass {
  static async commentPost({ series_id, post_id, user, content }) {
    return await SeriesModel.findOneAndUpdate(
      { _id: series_id, 'posts._id': post_id },
      {
        $push: {
          'posts.$.comments': { user, content }
        }
      },
      { new: true }
    ).lean();
  }
  static async deleteReview({ series_id, review_id }) {
    // update star and avg
    const series = await SeriesModel.findOne({ _id: series_id }).lean();
    const review = series.reviews.find(review => review._id == review_id);
    const rating_star = `rating.star_${review.rating}`;
    const rating_avg = 'rating.avg';
    const rating_star_number = series.rating[`star_${review.rating}`] - 1;
    const rating_avg_number =
      (series.rating.avg * series.reviews.length - review.rating) /
      (series.reviews.length - 1);

    await SeriesModel.findOneAndUpdate(
      { _id: series_id },
      {
        $set: {
          [rating_star]: rating_star_number,
          [rating_avg]: rating_avg_number
        }
      }
    );

    // delete review
    return await SeriesModel.findOneAndUpdate(
      { _id: series_id },
      { $pull: { reviews: { _id: review_id } } },
      { new: true }
    ).lean();
  }
  static async reviewSeries({ user, series_id, rating, content }) {
    const series = await SeriesModel.findOne({ _id: series_id }).lean();
    const rating_star = `rating.star_${rating}`;
    const rating_avg = 'rating.avg';
    const rating_star_number = series.rating[`star_${rating}`] + 1;
    const rating_avg_number =
      (series.rating.avg * series.reviews.length + rating) /
      (series.reviews.length + 1);

    await SeriesModel.findOneAndUpdate(
      { _id: series_id },
      {
        $set: {
          [rating_star]: rating_star_number,
          [rating_avg]: rating_avg_number
        }
      }
    );

    return await SeriesModel.findOneAndUpdate(
      { _id: series_id },
      {
        $push: {
          reviews: { user, rating, content }
        }
      },
      { new: true }
    ).lean();
  }
  static async deleteSeries({ series_id, user }) {
    return await SeriesModel.findOneAndDelete({ _id: series_id, user }).lean();
  }
  static async deletePost({ series_id, post_id }) {
    return await SeriesModel.findOneAndUpdate(
      { _id: series_id },
      { $pull: { posts: { _id: post_id } } },
      { new: true }
    ).lean();
  }
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
    ).lean();
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
    ).lean();
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
    ).lean();
  }
  static async getSeriesById({ series_id, user, me_id }) {
    const condition = { _id: series_id };

    if (me_id !== user) {
      const check = FriendClass.isFriend({ user: me_id, friend: user });
      if (!check) {
        condition.visibility = 'public';
      } else {
        condition.visibility = { $ne: 'private' };
      }
    }

    return await SeriesModel.findOne(condition)
      .populate('user', pp_UserMore)
      .populate('posts.comments.user', pp_UserDefault)
      .populate('posts.comments.child.user', pp_UserDefault)
      .populate('posts.likes', pp_UserDefault)
      .populate('posts.saves', pp_UserDefault)
      .populate('reviews.user', pp_UserDefault)
      .lean();
  }
  static async getAllSeries({ user, limit, skip, sort, me_id }) {
    const condition = { user };
    if (me_id !== user) {
      const check = FriendClass.isFriend({ user: me_id, friend: user });
      if (!check) {
        condition.visibility = 'public';
      } else {
        condition.visibility = { $ne: 'private' };
      }
    }
    return await SeriesModel.find(condition)
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
