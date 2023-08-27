'use strict';
const UserModel = require('../models/user.model');
const KeyTokenModel = require('../models/keytoken.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const {
  BadRequestError,
  ConflicRequestError,
  AuthFailureError
} = require('../core/error.response');

class AuthService {
  static signUpService = async ({ name, email, password }) => {
    // check Email exist
    const foundUser = await UserModel.findByEmail({ email });
    if (foundUser) throw new BadRequestError('Error: Email already exists');

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await UserModel.createUser({
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

      const keyStore = await KeyTokenModel.createKeyToken({
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

  /*
    1 - Check email exist
    2 - Match password
    3 - Create privateKey vs publicKey
    4 - Generate tokens
    5 - Get data return login
  */
  static LoginService = async ({ email, password, refreshToken = null }) => {
    // 1 - Check email exist
    const foundUser = await UserModel.findByEmail({ email });
    if (!foundUser) throw new BadRequestError('User not registered');

    // 2 - Match password
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) throw new AuthFailuretError('Authentication error');

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

    const keyStore = await KeyTokenModel.createKeyToken({
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
}

module.exports = AuthService;
