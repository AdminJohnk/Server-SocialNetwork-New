'use strict';

const ChatService = require('../services/chat.service');
const { OK, CREATED } = require('../core/success.response');

class CommentController {
  /* 
    Remove Admin Role
    Link: http://localhost:4052/api/v1/chat/conversations/:conversation_id/admins/remove
    ["64fac9b2545bc6a41973744c"]
  */
  static removeAdmin = async (req, res, next) => {
    new OK({
      message: 'Remove Admin Successfully',
      metadata: await ChatService.removeAdmin({
        conversation_id: req.params.conversation_id,
        user: req.user.userId,
        admins: req.body
      })
    }).send(res);
  };
  /* 
    Appoint Admin
    Link: http://localhost:4052/api/v1/chat/conversations/:conversation_id/admins
    ["64fac9b2545bc6a41973744c"]
  */
  static appointAdmin = async (req, res, next) => {
    new OK({
      message: 'Appoint Admin Successfully',
      metadata: await ChatService.appointAdmin({
        conversation_id: req.params.conversation_id,
        user: req.user.userId,
        members: req.body
      })
    }).send(res);
  };
  /* 
    Leave Group Conversation
    Link: http://localhost:4052/api/v1/chat/conversations/:conversation_id/leave
  */
  static leaveGroupConversation = async (req, res, next) => {
    new OK({
      message: 'Leave Group Conversation Successfully',
      metadata: await ChatService.leaveGroupConversation({
        conversation_id: req.params.conversation_id,
        user_id: req.user.userId
      })
    }).send(res);
  };
  /* 
    Get All Conversations By User ID
    Link: http://localhost:4052/api/v1/chat/conversations
  */
  static deleteConversation = async (req, res, next) => {
    new OK({
      message: 'Delete Conversation Successfully',
      metadata: await ChatService.deleteConversation({
        conversation_id: req.params.conversation_id,
        user: req.user.userId
      })
    }).send(res);
  };
  /* 
    Change Conversation Cover Image
    Link: http://localhost:4052/api/v1/chat/conversations/:conversation_id/cover-image?type=group
  */
  static changeConversationCoverImage = async (req, res, next) => {
    new OK({
      message: 'Change Conversation Cover Image Successfully',
      metadata: await ChatService.changeConversationCoverImage({
        conversation_id: req.params.conversation_id,
        image: req.file,
        user: req.user.userId,
        type: req.query.type
      })
    }).send(res);
  };
  /* 
    Change Conversation Image
    Link: http://localhost:4052/api/v1/chat/conversations/:conversation_id/image
  */
  static changeConversationImage = async (req, res, next) => {
    new OK({
      message: 'Change Conversation Image Successfully',
      metadata: await ChatService.changeConversationImage({
        conversation_id: req.params.conversation_id,
        image: req.file,
        user: req.user.userId
      })
    }).send(res);
  };
  /* 
    Delete Member From Conversation
    Link: http://localhost:4052/api/v1/chat/conversations/:conversation_id/members/delete
    ["65143a4b4d4280e1868fb6de"]
  */
  static deleteMemberFromConversation = async (req, res, next) => {
    new OK({
      message: 'Delete Member From Conversation Successfully',
      metadata: await ChatService.deleteMemberFromConversation({
        members: req.body,
        conversation_id: req.params.conversation_id,
        user_id: req.user.userId
      })
    }).send(res);
  };
  /* 
    Add Member To Conversation
    Link: http://localhost:4052/api/v1/chat/conversations/:conversation_id/members
    ["65143a4b4d4280e1868fb6de"]
  */
  static addMemberToConversation = async (req, res, next) => {
    new OK({
      message: 'Add Member To Conversation Successfully',
      metadata: await ChatService.addMemberToConversation({
        members: req.body,
        conversation_id: req.params.conversation_id,
        user_id: req.user.userId
      })
    }).send(res);
  };
  /* 
    Change Conversation Name
    Link: http://localhost:4052/api/v1/chat/conversations/:conversation_id/name
    {
      "name": "New Name"
    }
  */
  static changeConversationName = async (req, res, next) => {
    new OK({
      message: 'Change Conversation Name Successfully',
      metadata: await ChatService.changeConversationName({
        ...req.body,
        conversation_id: req.params.conversation_id,
        user_id: req.user.userId
      })
    }).send(res);
  };
  /* 
    Get All Conversations By User ID
    Link: http://localhost:4052/api/v1/chat/conversations
  */
  static getAllConversationsByUserId = async (req, res, next) => {
    new OK({
      message: 'Get All Conversations Successfully',
      metadata: await ChatService.getAllConversationsByUserId({
        user_id: req.user.userId
      })
    }).send(res);
  };

  /*
    Get All Conversations By Message Types
  */
  static getConversationsByMessageTypes = async (req, res, next) => {
    console.log(req)
    new OK({
      message: 'Get Conversations Successfully',
      metadata: await ChatService.getConversationsByMessageTypes({
        user_id: req.user.userId
      })
    }).send(res);
  };

  /* 
    Get Messages By Conversation ID
    Link: http://localhost:4052/api/v1/chat/conversations/:conversation_id/messages
  */
  static getMessagesByConversationId = async (req, res, next) => {
    new OK({
      message: 'Get Messages Successfully',
      metadata: await ChatService.getMessagesByConversationId({
        conversation_id: req.params.conversation_id,
        page: req.query.page,
        extend: parseInt(req.query.extend)
      })
    }).send(res);
  };
  /* 
    Get Conversation By ID
    Link: http://localhost:4052/api/v1/chat/conversations/find/:conversation_id
  */
  static getConversationById = async (req, res, next) => {
    new OK({
      message: 'Get Conversation Successfully',
      metadata: await ChatService.getConversationById({
        conversation_id: req.params.conversation_id
      })
    }).send(res);
  };
  /* 
    Create Conversation
    Link: http://localhost:4052/api/v1/chat/conversations/create
    {
      "type": "private",
      "members": ["65143a4b4d4280e1868fb6de"]
    }
  */
  static createConverSation = async (req, res, next) => {
    new OK({
      message: 'Create Conversation Successfully',
      metadata: await ChatService.createConverSation({
        ...req.body,
        user: req.user.userId
      })
    }).send(res);
  };
  /* 
    Get Token For Call
    Link: http://localhost:4052/api/v1/chat/token
  */
  static getTokenForCall = async (req, res, next) => {
    new OK({
      message: 'Get Token For Call Successfully',
      metadata: await ChatService.getTokenForCall({
        user_id: req.user.userId,
        conversation_id: req.query.conversation_id,
        type: req.query.type
      })
    }).send(res);
  };
}

module.exports = CommentController;
