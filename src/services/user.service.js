'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const { getInfoData, limitData } = require('../utils');
const axios = require('axios');
const { UserClass } = require('../models/user.model');

class UserService {
  static getRepositoryGithub = async ({ access_token_github }) => {
    const { data: result } = await axios.get(
      'https://api.github.com/user/repos',
      {
        headers: {
          Authorization: `Bearer ${access_token_github}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );
    if (!result) throw new BadRequestError('Cannot get repository github');

    const repos = await Promise.all(
      result.map(async repository => {
        const { data } = await axios.get(repository.languages_url, {
          headers: {
            Authorization: `Bearer ${access_token_github}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });

        const result = getInfoData({
          fields: [
            'id',
            'name',
            'private',
            'html_url',
            'watchers_count',
            'forks_count',
            'stargazers_count'
          ],
          object: repository
        });

        result.languages = Object.keys(data)[0];

        return result;
      })
    );
    return limitData({ data: repos, limit: 1000, page: 1 });
  };
  static getShouldFollow = async ({ user_id }) => {
    return await UserClass.getShouldFollow({
      user_id
    });
  };
  static findUserById = async ({ user_id }) => {
    return await UserClass.findByID({
      user_id
    });
  };
  static updateUserById = async ({ user_id, payload }) => {
    return await UserClass.updateByID({
      user_id,
      payload
    });
  };
}

module.exports = UserService;
