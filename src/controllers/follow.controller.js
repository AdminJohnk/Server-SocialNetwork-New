'use strict';

const FollowService = require('../services/follow.service');
const { OK, CREATED } = require('../core/success.response');

class FollowController {
  static followUser = async (req, res, next) => {
    new OK({
      message: 'Follow User Successfully',
      metadata: await FollowService.followUser({
        meId: req.user.userId,
        user_id: req.params.user_id
      })
    }).send(res);
  };
  static getListFollowersByUserId = async (req, res, next) => {
    new OK({
      message: 'Get List Followers Successfully',
      metadata: await FollowService.getListFollowersByUserId({
        user_id: req.params.user_id
      })
    }).send(res);
  };
  static getListFollowingByUserId = async (req, res, next) => {
    new OK({
      message: 'Get List Followers Successfully',
      metadata: await FollowService.getListFollowingByUserId({
        user_id: req.params.user_id
      })
    }).send(res);
  };
}

module.exports = FollowController;
