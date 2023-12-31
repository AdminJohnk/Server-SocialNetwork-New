'use strict';

const CommunityService = require('../services/community.service');
const { OK, CREATED } = require('../core/success.response');

class CommunityController {
  static searchMember = async (req, res, next) => {
    new OK({
      message: 'Search Member Successfully',
      metadata: await CommunityService.searchMember({
        ...req.body,
        community_id: req.params.community_id
      })
    }).send(res);
  };
  static followCommunity = async (req, res, next) => {
    new OK({
      message: 'Follow Community Successfully',
      metadata: await CommunityService.followCommunity({
        community_id: req.params.community_id,
        user_id: req.user.userId
      })
    }).send(res);
  };
  static acceptPost = async (req, res, next) => {
    new OK({
      message: 'Accept Post Successfully',
      metadata: await CommunityService.acceptPost({
        ...req.body,
        community_id: req.params.community_id,
        admin_id: req.user.userId
      })
    }).send(res);
  };
  static deleteMemberFromCommunity = async (req, res, next) => {
    new OK({
      message: 'Delete Member From Community Successfully',
      metadata: await CommunityService.deleteMemberFromCommunity({
        ...req.body,
        community_id: req.params.community_id,
        admin_id: req.user.userId
      })
    }).send(res);
  };
  static addMemberToCommunity = async (req, res, next) => {
    new OK({
      message: 'Add Member To Community Successfully',
      metadata: await CommunityService.addMemberToCommunity({
        ...req.body,
        community_id: req.params.community_id,
        admin_id: req.user.userId
      })
    }).send(res);
  };
  static acceptJoinRequest = async (req, res, next) => {
    new OK({
      message: 'Accept Join Request Successfully',
      metadata: await CommunityService.acceptJoinRequest({
        ...req.body,
        community_id: req.params.community_id,
        admin_id: req.user.userId
      })
    }).send(res);
  };
  static joinCommunity = async (req, res, next) => {
    new OK({
      message: 'Join Community Successfully',
      metadata: await CommunityService.joinCommunity({
        community_id: req.params.community_id,
        user_id: req.user.userId
      })
    }).send(res);
  };
  static updateCommunity = async (req, res, next) => {
    new OK({
      message: 'Update Community Successfully',
      metadata: await CommunityService.updateCommunity({
        ...req.body,
        author: req.user.userId,
        community_id: req.params.community_id
      })
    }).send(res);
  };
  static createCommunity = async (req, res, next) => {
    new CREATED({
      message: 'Create Community Successfully',
      metadata: await CommunityService.createCommunity({
        ...req.body,
        author: req.user.userId
      })
    }).send(res);
  };
  static getCommunityByID = async (req, res, next) => {
    new OK({
      message: 'Get Community Successfully',
      metadata: await CommunityService.getCommunityByID(req.params.community_id)
    }).send(res);
  };
}

module.exports = CommunityController;
