'use strict';

const ChatService = require('../services/chat.service');
const { OK, CREATED } = require('../core/success.response');

class CommentController {
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
    Get Messages By Conversation ID
    Link: http://localhost:4052/api/v1/chat/conversations/:conversation_id/messages
  */
  static getMessagesByConversationId = async (req, res, next) => {
    new OK({
      message: 'Get Messages Successfully',
      metadata: await ChatService.getMessagesByConversationId({
        conversation_id: req.params.conversation_id,
        page: req.query.page
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
}

module.exports = CommentController;
