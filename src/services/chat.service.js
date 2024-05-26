import { NotFoundError, ForbiddenError } from '../core/error.response.js';

import { UserClass } from '../models/user.model.js';
import { ConversationClass } from '../models/conversation.model.js';
import { MessageClass } from '../models/message.model.js';

import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { deleteImage } from '../helpers/uploadImage.js';

const livekitHost = process.env.LK_SERVER_URL;
const roomService = new RoomServiceClient(livekitHost, process.env.LK_API_KEY, process.env.LK_API_SECRET);

/**
 * @type {{get: (function(string): object), set: (function(string, object): void), del: (function(string): void)}}
 */
const cache = {
  get: (key) => cache[key],
  set: (key, value) => (cache[key] = value),
  del: (key) => delete cache[key]
};

class ChatService {
  static removeAdmin = async ({ conversation_id, user, admins }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    // Check is admin
    const isAdmin = await ConversationClass.checkExist({
      _id: conversation_id,
      admins: { $in: [user] }
    });
    if (!isAdmin) throw new ForbiddenError('You are not admin');

    // Check exist all admins
    const foundUsers = await UserClass.checkExistMany({ _id: { $in: admins } });
    if (foundUsers.length !== admins.length) throw new NotFoundError('User not found');

    // Check is admins
    const isMembers = await ConversationClass.checkExist({
      _id: conversation_id,
      admins: { $in: admins }
    });
    if (!isMembers) throw new NotFoundError('User are not admins');

    return await ConversationClass.removeAdmin({ admins, conversation_id });
  };
  static appointAdmin = async ({ conversation_id, user, members }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    // Check is admin
    const isAdmin = await ConversationClass.checkExist({
      _id: conversation_id,
      admins: { $in: [user] }
    });
    if (!isAdmin) throw new ForbiddenError('You are not admin');

    // Check exist all members
    const foundUsers = await UserClass.checkExistMany({ _id: { $in: members } });
    if (foundUsers.length !== members.length) throw new NotFoundError('User not found');

    // Check is members
    const isMembers = await ConversationClass.checkExist({
      _id: conversation_id,
      members: { $in: members }
    });
    if (!isMembers) throw new NotFoundError('User are not members');

    return await ConversationClass.appointAdmin({ members, conversation_id });
  };
  static leaveGroupConversation = async ({ conversation_id, user_id }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    return await ConversationClass.leaveGroupConversation({
      conversation_id,
      user_id
    });
  };
  static dissolveGroup = async ({ conversation_id, user }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    // Check is admin
    const isAdmin = await ConversationClass.checkExist({
      _id: conversation_id,
      admins: { $in: [user] }
    });

    if (!isAdmin) throw new ForbiddenError('You are not admin');

    const result = await ConversationClass.dissolveGroup({ conversation_id });

    // Delete all messages
    await MessageClass.deleteMessagesByConversationId({ conversation_id });

    return result;
  };

  static async deleteConversation({ conversation_id, user_id }) {
    const foundConversation = await ConversationClass.checkExist({ _id: conversation_id });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    return await ConversationClass.deleteConversation({ conversation_id, user_id });
  }
  static changeConversationCoverImage = async ({ conversation_id, image, user, type }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    if (type === 'group') {
      // Check is admin
      const isAdmin = await ConversationClass.checkExist({
        _id: conversation_id,
        admins: { $in: [user] }
      });

      if (!isAdmin) throw new ForbiddenError('You are not admin');
    }

    const { key } = image;

    // Delete old image
    if (foundConversation.cover_image) deleteImage(foundConversation.cover_image);

    return await ConversationClass.changeConversationCoverImage({
      conversation_id,
      cover_image: key
    });
  };
  static changeConversationImage = async ({ conversation_id, image, user }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    // Check is admin
    const isAdmin = await ConversationClass.checkExist({
      _id: conversation_id,
      admins: { $in: [user] }
    });

    if (!isAdmin) throw new ForbiddenError('You are not admin');

    const { key } = image;

    // Delete old image
    if (foundConversation.image) deleteImage(foundConversation.image);

    return await ConversationClass.changeConversationImage({
      conversation_id,
      image: key
    });
  };
  static deleteMemberFromConversation = async ({ user_id, members, conversation_id }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    // Check is admin
    const isAdmin = await ConversationClass.checkExist({
      _id: conversation_id,
      admins: { $in: [user_id] }
    });

    if (!isAdmin) throw new ForbiddenError('You are not admin');

    // Check exist all members
    const foundUsers = await UserClass.checkExistMany({ _id: { $in: members } });
    if (foundUsers.length !== members.length) throw new NotFoundError('User not found');

    return await ConversationClass.deleteMemberFromConversation({
      members,
      conversation_id
    });
  };
  static addMemberToConversation = async ({ user_id, members, conversation_id }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    // Check is admin
    const isAdmin = await ConversationClass.checkExist({
      _id: conversation_id,
      admins: { $in: [user_id] }
    });
    if (!isAdmin) throw new ForbiddenError('You are not admin');

    // Check exist all members
    const foundUsers = await UserClass.checkExistMany({ _id: { $in: members } });
    if (foundUsers.length !== members.length) throw new NotFoundError('User not found');

    return await ConversationClass.addMemberToConversation({
      members,
      conversation_id
    });
  };
  static changeConversationName = async ({ user_id, name, conversation_id }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    // Check is admin
    const isAdmin = await ConversationClass.checkExist({
      _id: conversation_id,
      admins: { $in: [user_id] }
    });
    if (!isAdmin) throw new ForbiddenError('You are not admin');

    return await ConversationClass.changeConversationName({
      name,
      conversation_id
    });
  };
  static getAllConversationsByUserId = async ({ user_id, limit = 7, page = 1, sort = { updatedAt: -1 } }) => {
    return await ConversationClass.getAllConversationsByUserId({
      user_id,
      limit,
      page,
      sort
    });
  };
  static getAllUsersUsedToChatWith = async ({ user_id, sort = { createdAt: -1 } }) => {
    return await ConversationClass.getAllUsersUsedToChatWith({
      user_id,
      sort
    });
  };
  static getConversationsByMessageTypes = async ({
    user_id,
    limit = 7,
    page = 1,
    sort = { createdAt: -1 }
  }) => {
    return await ConversationClass.getConversationsByMessageTypes({
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
    sort = { createdAt: -1 },
    user
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
      extend,
      user
    });
  };
  static getImageMessageByConversationId = async ({
    conversation_id,
    limit = 30,
    page = 1,
    extend = 0,
    sort = { createdAt: 1 }
  }) => {
    const foundConversation = await ConversationClass.checkExist({ _id: conversation_id });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    return await MessageClass.getImageMessageByConversationId({
      conversation_id,
      limit,
      page,
      sort,
      extend
    });
  };
  static getConversationById = async ({ conversation_id,user_id }) => {
    const foundConversation = await ConversationClass.checkExist({
      _id: conversation_id
    });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    return await ConversationClass.getConversationById({ conversation_id,user_id });
  };
  static createConverSation = async ({ type, name, members, user }) => {
    // check exist all members
    const foundUsers = await UserClass.checkExistMany({ _id: { $in: members } });
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

    const foundConversation = await ConversationClass.checkExist({ _id: conversation_id });
    if (!foundConversation) throw new NotFoundError('Conversation not found');

    // Check is member
    const isMember = foundConversation.members.find((member) => member.toString() === user_id);
    if (!isMember) throw new ForbiddenError('You are not member of this conversation');

    let first_call = false;
    const roomName = conversation_id + '-' + type;

    await roomService.listRooms().then(async (rooms) => {
      const foundRoom = rooms.find((room) => room.name === roomName);
      if (!foundRoom) {
        first_call = true;
        cache.set(roomName, foundUser);
        await roomService.createRoom({ name: roomName, departureTimeout: 0, emptyTimeout: 0 });
      }
    });

    const participantName = foundUser.name;

    const at = new AccessToken(process.env.LK_API_KEY, process.env.LK_API_SECRET, {
      identity: foundUser._id.toString(),
      name: participantName,
      metadata: foundUser.user_image
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true
    });

    return {
      token: await at.toJwt(),
      conversation_id,
      typeofConversation: foundConversation.type,
      conversation_name: foundConversation.name,
      author: cache.get(roomName),
      user_name: participantName,
      user_image: foundUser.user_image,
      user_id: foundUser._id.toString(),
      first_call,
      members: foundConversation.members
    };
  };
  static deleteCall = async ({ conversation_id, type }) => {
    const roomName = conversation_id + '-' + type;

    await roomService.listRooms().then(async (rooms) => {
      const foundRoom = rooms.find((room) => room.name === roomName);
      if (foundRoom) {
        cache.del(roomName);
        await roomService.deleteRoom(roomName);
      }
    });

    return true;
  };
}

export default ChatService;
