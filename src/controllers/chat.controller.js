'use strict';

const ChatService = require('../services/chat.service');
const { OK, CREATED } = require('../core/success.response');

class CommentController {
  static getAllConversationsByUserId = async (req, res, next) => {
    new OK({
      message: 'Get All Conversations Successfully',
      metadata: await ChatService.getAllConversationsByUserId({
        user_id: req.user.userId
      })
    }).send(res);
  };
  static getMessagesByConversationId = async (req, res, next) => {
    new OK({
      message: 'Get Messages Successfully',
      metadata: await ChatService.getMessagesByConversationId({
        conversation_id: req.params.conversation_id
      })
    }).send(res);
  };
  static getConversationById = async (req, res, next) => {
    new OK({
      message: 'Get Conversation Successfully',
      metadata: await ChatService.getConversationById({
        conversation_id: req.params.conversation_id
      })
    }).send(res);
  };
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
