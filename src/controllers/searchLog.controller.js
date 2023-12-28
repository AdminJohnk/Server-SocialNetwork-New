'use strict';

const SearchLogService = require('../services/searchLog.service');
const { OK, CREATED } = require('../core/success.response');

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
}

module.exports = SearchLogController;
