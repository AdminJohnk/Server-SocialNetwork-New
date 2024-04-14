'use strict';
import { AuthFailureError, NotFoundError, ForbiddenError } from '../core/error.response.js';
import { SearchLogClass } from '../models/searchLog.model.js';
import { limitData } from '../utils/functions.js';

class SearchLogService {
  static async createSearchLog({ user, keyword, recently_search }) {
    return await SearchLogClass.createSearchLog({ user, keyword, recently_search });
  }
  static async getSearchLog({ user }) {
    return await SearchLogClass.getSearchLog({ user });
  }
  static async deleteSearchLog({ user, keyword, recently_search }) {
    return await SearchLogClass.deleteSearchLog({ user, keyword, recently_search });
  }
}

export default SearchLogService;
