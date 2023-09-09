'use strict';

const { FollowClass } = require('../models/follow.model');
const { UserClass } = require('../models/user.model');
const { getSelectData } = require('../utils');
const { BadRequestError, NotFoundError } = require('../core/error.response');

class FollowService {
  static async followUser({ meId, user_id }) {
    const foundUser = UserClass.findByID(user_id);
    if (!foundUser) throw new NotFoundError('User not found');
    return await FollowClass.followUser({ meId, user_id });
  }
  static async getListFollowersByUserId({
    user_id,
    limit = 30,
    page = 1,
    sort = 'ctime'
  }) {
    const foundUser = UserClass.findByID(user_id);
    if (!foundUser) throw new NotFoundError('User not found');
    const skip = (page - 1) * limit;
    return await FollowClass.getListFollowersByUserId({
      user_id,
      limit,
      skip,
      sort
    });
  }
  static async getListFollowingByUserId({
    user_id,
    limit = 30,
    page = 1,
    sort = 'ctime'
  }) {
    const foundUser = UserClass.findByID(user_id);
    if (!foundUser) throw new NotFoundError('User not found');
    const skip = (page - 1) * limit;
    return await FollowClass.getListFollowingByUserId({
      user_id,
      limit,
      skip,
      sort
    });
  }
}

module.exports = FollowService;
