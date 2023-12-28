'use strict';
const { AuthFailureError, NotFoundError, ForbiddenError } = require('../core/error.response');
const { SearchLogClass } = require('../models/searchLog.model');
const { limitData } = require('../utils/functions');

class SearchLogService {
  static async createSearchLog({ user, keyword, recently_search }) {
    return await SearchLogClass.createSearchLog({ user, keyword, recently_search });
  }
  static async getSearchLog({ user }) {
    return await SearchLogClass.getSearchLog({ user });
  }
}

module.exports = SearchLogService;
