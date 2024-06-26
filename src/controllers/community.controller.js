'use strict';

import CommunityService from '../services/community.service.js';
import { OK, CREATED } from '../core/success.response.js';

class CommunityController {

  static getAllCommunities = async (req, res, next) => {
    new OK({
      message: 'Get All Communities Successfully',
      metadata: await CommunityService.getAllCommunities()
    }).send(res);
  }

  static cedeCreator = async (req, res, next) => {
    new OK({
      message: 'Cede Creator Successfully',
      metadata: await CommunityService.cedeCreator({
        community_id: req.params.community_id,
        new_creator_id: req.body.user_id,
        me_id: req.user.userId
      })
    }).send(res);
  };
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
        post_id: req.body.post_id,
        community_id: req.params.community_id,
        admin_id: req.user.userId
      })
    }).send(res);
  };
  static rejectPost = async (req, res, next) => {
    new OK({
      message: 'Reject Post Successfully',
      metadata: await CommunityService.rejectPost({
        post_id: req.body.post_id,
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
  static rejectJoinRequest = async (req, res, next) => {
    new OK({
      message: 'Reject Join Request Successfully',
      metadata: await CommunityService.rejectJoinRequest({
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
  static cancelJoinCommunity = async (req, res, next) => {
    new OK({
      message: 'Cancel Join Community Successfully',
      metadata: await CommunityService.cancelJoinCommunity({
        community_id: req.params.community_id,
        user_id: req.user.userId
      })
    }).send(res);
  };
  static leaveCommunity = async (req, res, next) => {
    new OK({
      message: 'Leave Community Successfully',
      metadata: await CommunityService.leaveCommunity({
        community_id: req.params.community_id,
        user_id: req.user.userId
      })
    }).send(res);
  };
  static promoteAdmin = async (req, res, next) => {
    new OK({
      message: 'Promote Admin Successfully',
      metadata: await CommunityService.promoteAdmin({
        community_id: req.params.community_id,
        admin_id: req.body.user_id,
        me_id: req.user.userId
      })
    }).send(res);
  };
  static revokeAdmin = async (req, res, next) => {
    new OK({
      message: 'Revoke Admin Successfully',
      metadata: await CommunityService.revokeAdmin({
        community_id: req.params.community_id,
        admin_id: req.body.user_id,
        me_id: req.user.userId
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
  static getCommunitiesByUserID = async (req, res, next) => {
    new OK({
      message: 'Get Community Successfully',
      metadata: await CommunityService.getCommunitiesByUserID(req.user.userId)
    }).send(res);
  };
  static getAllImagesByCommunityID = async (req, res, next) => {
    new OK({
      message: 'Get All Images By Community ID Successfully',
      metadata: await CommunityService.getAllImagesByCommunityID(req.params.community_id)
    }).send(res);
  };
  static getAllCommunitiesYouManage = async (req, res, next) => {
    new OK({
      message: 'Get All Communities You Manage Successfully',
      metadata: await CommunityService.getAllCommunitiesYouManage({
        user_id: req.user.userId,
        ...req.query
      })
    }).send(res);
  };
  static getPostByID = async (req, res, next) => {
    new OK({
      message: 'Get Post Successfully',
      metadata: await CommunityService.getPostByID(req.params)
    }).send(res);
  };
  static getPostsByCommunityID = async (req, res, next) => {
    new OK({
      message: 'Get Posts By Community ID Successfully',
      metadata: await CommunityService.getPostsByCommunityID({
        community_id: req.params.community_id,
        ...req.query
      })
    }).send(res);
  };
}

export default CommunityController;
