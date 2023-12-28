'use strict';

const { model, Schema, Types } = require('mongoose');
const { unGetSelectData, getSelectData } = require('../utils/functions');
const { avt_default, se_UserDefault, RoleUser } = require('../utils/constants');
const ObjectId = Types.ObjectId;
const { UserIncrClass } = require('./user_incr.model');

const DOCUMENT_NAME = 'SearchLog';
const COLLECTION_NAME = 'search_logs';

const SearchLogSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User', index: true },
    keywords: {
      type: [String],
      default: []
    },
    recently_search: {
      type: [ObjectId],
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
    versionKey: false
  }
);

const SearchLogModel = model(DOCUMENT_NAME, SearchLogSchema);

class SearchLogClass {
  static async createSearchLog({ user, keyword, recently_search }) {
    const foundSearchLog = await SearchLogModel.findOne({ user });
    if (!foundSearchLog) {
      const newSearchLog = await SearchLogModel.create({
        user,
        keywords: [keyword],
        recently_search
      });
      return newSearchLog;
    }
    const { keywords } = foundSearchLog;
    const newKeywords = new Set([...keywords, keyword]);
    await SearchLogModel.updateOne({ user }, { keywords: [...newKeywords] });
    return foundSearchLog;
  }
  static async getSearchLog({ user }) {
    const foundSearchLog = await SearchLogModel.findOne({ user }).populate({
      path: 'recently_search',
      select: '_id name user_image'
    });
    if (!foundSearchLog) return [];
    const { recently_search } = foundSearchLog;
    return recently_search;
  }
}

module.exports = {
  SearchLogModel,
  SearchLogClass
};
