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
    limit = 30,
    page = 1,
    extend = 0,
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
      sort,
      extend
    });
  };
  static getConversationById = async ({ conversation_id }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    return await ConversationClass.getConversationById({ conversation_id });
  };
  static createConverSation = async ({ type, name, members, user }) => {
    // check exist all members
    const foundUsers = await UserClass.checkExist({ _id: { $in: members } });
    if (foundUsers.length !== members.length) throw new NotFoundError('User not found');

    return await ConversationClass.createConverSation({
      type,
      members: [...members, user],
      name,
      author: user
    });
  };
}

module.exports = ChatService;
