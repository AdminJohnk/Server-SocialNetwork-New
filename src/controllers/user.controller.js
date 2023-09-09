'use strict';

const UserService = require('../services/user.service');
const { OK, CREATED } = require('../core/success.response');
const { HEADER } = require('../auth/authUtils');

class UserController {
  static getRepositoryGithub = async (req, res, next) => {
    new OK({
      message: 'Get Repository Github Successfully',
      metadata: await UserService.getRepositoryGithub({
        access_token_github: req.headers[HEADER.GITHUB_TOKEN]
      })
    }).send(res);
  };
  static getShouldFollow = async (req, res, next) => {
    new OK({
      message: 'Get Should Follow Successfully',
      metadata: await UserService.getShouldFollow({
        user_id: req.user.userId
      })
    }).send(res);
  };
  static findUserById = async (req, res, next) => {
    new OK({
      message: 'Get User Successfully',
      metadata: await UserService.findUserById({
        user_id: req.params.user_id
      })
    }).send(res);
  };
  static updateUserById = async (req, res, next) => {
    new OK({
      message: 'Update User Successfully',
      metadata: await UserService.updateUserById({
        user_id: req.params.user_id,
        payload: { ...req.body }
      })
    }).send(res);
  };
}

module.exports = UserController;
