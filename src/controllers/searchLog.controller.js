'use strict';

import SearchLogService from '../services/searchLog.service.js';
import { OK, CREATED } from '../core/success.response.js';

class SearchLogController {
  static async createSearchLog(req, res, next) {
    new OK({
      message: 'Create Search Log Successfully',
      metadata: await SearchLogService.createSearchLog({
        user: req.user.userId,
        ...req.body
      })
    }).send(res);
  }
  static async getSearchLog(req, res, next) {
    new OK({
      message: 'Get Search Log Successfully',
      metadata: await SearchLogService.getSearchLog({
        user: req.user.userId
      })
    }).send(res);
  }
  static async deleteSearchLog(req, res, next) {
    new OK({
      message: 'Delete Search Log Successfully',
      metadata: await SearchLogService.deleteSearchLog({
        user: req.user.userId,
        ...req.body
      })
    }).send(res);
  }
}

export default SearchLogController;
