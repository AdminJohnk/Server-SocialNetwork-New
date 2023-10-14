const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../core/error.response');

const { UserClass } = require('../models/user.model');
const { ConversationClass } = require('../models/conversation.model');
const { MessageClass } = require('../models/message.model');

class ChatService {
  static getAllConversationsByUserId = async ({ user_id, limit = 7, page = 1, sort = { updatedAt: -1 } }) => {
    return await ConversationClass.getAllConversationsByUserId({
      user_id,
      limit,
      page,
      sort
    });
  };
  static getMessagesByConversationId = async ({
    conversation_id,
    limit = 20,
    page = 1,
    sort = { createdAt: -1 }
  }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    return await MessageClass.getMessagesByConversationId({
      conversation_id,
      limit,
      page,
      sort
    });
  };
  static getConversationById = async ({ conversation_id }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    return await ConversationClass.getConversationById({ conversation_id });
  };
  static createConverSation = async ({ type, members, user }) => {
    if (type === 'private') {
      const foundUser = await UserClass.checkExist({ _id: members[0] });
      if (!foundUser) throw new NotFoundError('User not found');

      const newConversation = await ConversationClass.createConverSation({
        type,
        members: [...members, user]
      });
      return newConversation;
    }
  };
}

module.exports = ChatService;
