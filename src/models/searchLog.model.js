'use strict';

import { model, Schema, Types } from 'mongoose';
import { unGetSelectData, getSelectData } from '../utils/functions.js';
import { avt_default, se_UserDefault, RoleUser } from '../utils/constants.js';
const ObjectId = Types.ObjectId;
import { UserIncrClass } from './user_incr.model.js';

const DOCUMENT_NAME = 'SearchLog';
const COLLECTION_NAME = 'search_logs';

const SearchLogSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User', index: true },
    keywords: {
      type: [String],
      default: []
    },
    recently_search_list: {
      type: [ObjectId],
      ref: 'User',
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
        keywords: keyword ? [keyword] : [],
        recently_search_list: recently_search ? [recently_search] : []
      });
      return newSearchLog;
    }
    const { keywords } = foundSearchLog;
    const { recently_search_list } = foundSearchLog;
    if (keyword && !keywords.includes(keyword)) {
      keywords.unshift(keyword);
      if (keywords.length > 3) keywords.pop();
    } else {
      const index = keywords.indexOf(keyword);
      if (index > -1) {
        keywords.splice(index, 1);
        keywords.unshift(keyword);
      }
    }
    if (recently_search && !recently_search_list.includes(recently_search)) {
      recently_search_list.unshift(recently_search);
      if (recently_search_list.length > 3) recently_search_list.pop();
    } else {
      const index = recently_search_list.indexOf(recently_search);
      if (index > -1) {
        recently_search_list.splice(index, 1);
        recently_search_list.unshift(recently_search);
      }
    }
    await SearchLogModel.updateOne(
      { user },
      {
        keywords,
        recently_search_list
      }
    );
    return foundSearchLog;
  }
  static async getSearchLog({ user }) {
    const foundSearchLog = await SearchLogModel.findOne({ user }).populate({
      path: 'recently_search_list',
      select: '_id name user_image'
    });
    if (!foundSearchLog) return null;
    return foundSearchLog;
  }
  static async deleteSearchLog({ user, keyword, recently_search }) {
    const foundSearchLog = await SearchLogModel.findOne({ user });
    if (!foundSearchLog) return null;
    const { keywords } = foundSearchLog;
    const { recently_search_list } = foundSearchLog;
    if (keyword) {
      const index = keywords.indexOf(keyword);
      if (index > -1) {
        keywords.splice(index, 1);
      }
    }
    if (recently_search) {
      const index = recently_search_list.indexOf(recently_search);
      if (index > -1) {
        recently_search_list.splice(index, 1);
      }
    }
    await SearchLogModel.updateOne(
      { user },
      {
        keywords,
        recently_search_list
      }
    );
    return foundSearchLog;
  }
}

export { SearchLogModel, SearchLogClass };
