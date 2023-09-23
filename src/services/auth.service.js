'use strict';
const { UserClass } = require('../models/user.model');
const { KeyTokenClass } = require('../models/keytoken.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils/functions');
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError
} = require('../core/error.response');

class AuthService {
  static handleRefreshToken = async ({ refreshToken, keyStore, user }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      // Xóa tất cả token trong keyStore
      await KeyTokenClass.deleteKeyById(userId);
      throw new ForbiddenError('Something went wrong!! Please login again');
    }

    // keyStore.refreshToken là Token đang sử dụng so sánh với refreshToken gửi lên
    if (keyStore.refreshToken !== refreshToken)
      throw new AuthFailureError('User not registered');

    const foundUser = await UserClass.findByEmail({ email });
    if (!foundUser) throw new AuthFailureError('User not registered');

    // create accessToken và refreshToken
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    // update Token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken
      }
    });
    return {
      user,
      tokens
    };
  };

  static logoutService = async keyStore => {
    const delKey = await KeyTokenClass.removeKeyByID(keyStore._id);
    return delKey;
  };

  static loginService = async ({ email, password, refreshToken = null }) => {
    // 1 - Check email exist
    const foundUser = await UserClass.findByEmail({ email });
    if (!foundUser) throw new BadRequestError('User not registered');

    // 2 - Match password
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) throw new AuthFailureError('Authentication error');

    // 3 - Create privateKey vs publicKey

    // const privateKey = crypto.randomBytes(64).toString('hex');
    // const publicKey = crypto.randomBytes(64).toString('hex');

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      }
    });

    // 4 - Generate accessTokens vs refreshToken
    const tokens = await createTokenPair(
      { userId: foundUser._id, email },
      publicKey,
      privateKey
    );

    const keyStore = await KeyTokenClass.createKeyToken({
      userId: foundUser._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken
    });

    if (!keyStore) throw new BadRequestError('Error: Cant create keyStore!');

    // 5 - Get data return login
    return {
      user: getInfoData({
        fields: ['_id', 'name', 'email'],
        object: foundUser
      }),
      tokens
    };
  };

  static signUpService = async ({ name, email, password }) => {
    // check Email exist
    const foundUser = await UserClass.findByEmail({ email });
    if (foundUser) throw new BadRequestError('Error: Email already exists');

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await UserClass.createUser({
      name,
      email,
      password: passwordHash
    });

    if (newUser) {
      // create privateKey, publicKey

      // const privateKey = crypto.randomBytes(64).toString('hex');
      // const publicKey = crypto.randomBytes(64).toString('hex');

      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'pkcs1',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem'
        }
      });

      // create token pair
      const tokens = await createTokenPair(
        { userId: newUser._id, email },
        publicKey,
        privateKey
      );

      const keyStore = await KeyTokenClass.createKeyToken({
        userId: newUser._id,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken
      });

      if (!keyStore) throw new BadRequestError('Error: Cant create keyStore!');

      return {
        user: getInfoData({
          fields: ['_id', 'name', 'email'],
          object: newUser
        }),
        tokens
      };
    }
    return {
      code: 200,
      metadata: null
    };
  };
}

module.exports = AuthService;
