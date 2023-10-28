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

const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');

const livekitHost = process.env.LK_SERVER_URL;
const roomService = new RoomServiceClient(livekitHost, process.env.LK_API_KEY, process.env.LK_API_SECRET);

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
  static getTokenForCall = async ({ user_id, conversation_id, type }) => {
    const foundUser = await UserClass.checkExist({ _id: user_id });
    if (!foundUser) throw new NotFoundError('User not found');

    const room = conversation_id + '-' + type;

    await roomService.listRooms().then(async (rooms) => {
      const foundRoom = rooms.find((room) => room.name === room);
      if (!foundRoom) {
        await roomService.createRoom({ name: room, emptyTimeout: 30 });
      }
    });

    const participantName = foundUser[0].name;

    const at = new AccessToken(process.env.LK_API_KEY, process.env.LK_API_SECRET, {
      identity: participantName,
      name: participantName
    });
    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

    return at.toJwt();
  };
}

module.exports = ChatService;
