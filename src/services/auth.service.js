'use strict';
import { UserClass } from '../models/user.model.js';
import { KeyTokenClass } from '../models/keytoken.model.js';
import * as bcrypt from 'bcrypt';
import { randomBytes, generateKeyPairSync } from 'crypto';
import { stringify, parse } from 'qs';
import { createTokenPair } from '../auth/authUtils.js';
import { getInfoData } from '../utils/functions.js';
import { BadRequestError, AuthFailureError, ForbiddenError } from '../core/error.response.js';
import axios from 'axios';
import { sendMailForgotPassword } from '../configs/mailTransport.js';

/**
 * @type {{get: (function(string): {email: string, code: string, expireAt: number, timestamp: number, verified:boolean}), set: (function(string, {email: string, code: string, expireAt: number, timestamp: number}): void), del: (function(string): void)}}
 */
const cache = {
  get: (key) => cache[key],
  set: (key, value) => (cache[key] = value),
  del: (key) => delete cache[key]
};

/**
 *
 * @param {string} email - email of user
 * @returns {{email: string, code: string, expireAt: number, timestamp: number}}
 */
const generateCode = (email) => {
  const code = randomBytes(4).toString('hex');
  const timestamp = Date.now();
  const expireAt = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds
  return { email, code, expireAt, timestamp };
};

/**
 * @param {string} email - email of user
 * @returns {string}
 * @description Generate a code and store it in cache
 * @example
 */
const storeCache = (email) => {
  const setCode = generateCode(email);
  cache.set(email, setCode);
  setTimeout(() => cache.del(email), 10 * 60 * 1000); // 10 minutes in milliseconds
  return setCode.code;
};

class AuthService {
  static handleRefreshToken = async ({ refreshToken, keyStore, user }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      // Xóa tất cả token trong keyStore
      await KeyTokenClass.deleteKeyById(userId);
      throw new ForbiddenError('Something went wrong!! Please login again');
    }

    // keyStore.refreshToken là Token đang sử dụng so sánh với refreshToken gửi lên
    if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError('User not registered');

    const foundUser = await UserClass.findByEmail({ email });
    if (!foundUser) throw new AuthFailureError('User not registered');

    // create accessToken và refreshToken
    const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey);

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

  static logoutService = async (keyStore) => {
    const delKey = await KeyTokenClass.removeKeyByID(keyStore._id);
    return delKey;
  };

  static loginService = async ({ email, password, refreshToken = null }) => {
    // 1 - Check email exist
    const foundUser = await UserClass.findByEmail({ email });
    if (!foundUser) throw new BadRequestError('Email not exists!');

    // 2 - Match password
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) throw new AuthFailureError('Wrong password!');

    // 3 - Create privateKey vs publicKey

    // const privateKey = crypto.randomBytes(64).toString('hex');
    // const publicKey = crypto.randomBytes(64).toString('hex');

    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // 4 - Generate accessTokens vs refreshToken
    const tokens = await createTokenPair({ userId: foundUser._id, email }, publicKey, privateKey);

    const keyStore = await KeyTokenClass.createKeyToken({
      userId: foundUser._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken
    });

    if (!keyStore) throw new BadRequestError("Can't create keyStore!");
    if (!keyStore) throw new BadRequestError("Can't create keyStore!");

    // 5 - Get data return login
    return {
      user: getInfoData({
        fields: ['id', '_id', 'email'],
        object: foundUser
      }),
      tokens
    };
  };

  static loginWithGoogleService = async ({ email, family_name, given_name, picture }) => {
    // Check if user exists
    const foundUser = await UserClass.findByEmail({ email });
    if (foundUser) {
      const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      // create token pair
      const tokens = await createTokenPair({ userId: foundUser._id, email }, publicKey, privateKey);

      const keyStore = await KeyTokenClass.createKeyToken({
        userId: foundUser._id,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken
      });

      if (!keyStore) throw new BadRequestError("Can't create keyStore!");

      return {
        user: getInfoData({
          fields: ['id', '_id', 'email'],
          object: foundUser
        }),
        tokens
      };
    }

    const newUser = await UserClass.createUser({
      name: family_name + ' ' + given_name,
      email,
      user_image: picture
    });

    if (newUser) {
      const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      // create token pair
      const tokens = await createTokenPair({ userId: newUser._id, email }, publicKey, privateKey);

      const keyStore = await KeyTokenClass.createKeyToken({
        userId: newUser._id,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken
      });

      if (!keyStore) throw new BadRequestError("Can't create keyStore!");

      return {
        user: getInfoData({
          fields: ['id', '_id', 'email'],
          object: newUser
        }),
        tokens
      };
    }
  };

  static loginWithGithubService = async ({ email, name, avatar_url }) => {
    const foundUser = await UserClass.findByEmail({ email });
    if (foundUser) {
      const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      // create token pair
      const tokens = await createTokenPair({ userId: foundUser._id, email }, publicKey, privateKey);

      const keyStore = await KeyTokenClass.createKeyToken({
        userId: foundUser._id,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken
      });

      if (!keyStore) throw new BadRequestError("Can't create keyStore!");
      return {
        user: getInfoData({
          fields: ['id', '_id', 'email'],
          object: foundUser
        }),
        tokens,
        accessTokenGitHub: accessTokenGitHub
      };
    }

    const newUser = await UserClass.createUser({
      name: name,
      email,
      user_image: avatar_url
    });

    if (newUser) {
      const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      // create token pair
      const tokens = await createTokenPair({ userId: newUser._id, email }, publicKey, privateKey);

      const keyStore = await KeyTokenClass.createKeyToken({
        userId: newUser._id,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken
      });

      if (!keyStore) throw new BadRequestError("Can't create keyStore!");

      return {
        user: getInfoData({
          fields: ['id', '_id', 'email'],
          object: newUser
        }),
        tokens,
        accessTokenGitHub: accessTokenGitHub
      };
    }
  };

  static signUpService = async ({ name, email, password, alias }) => {
    // check Alias exist
    const foundAlias = await UserClass.findByAlias({ alias });
    if (foundAlias) throw new BadRequestError('Alias already exists');

    // check Email exist
    const foundUser = await UserClass.findByEmail({ email });
    if (foundUser) throw new BadRequestError('Email already exists');

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await UserClass.createUser({
      name,
      email,
      password: passwordHash,
      alias
    });

    return {
      success: !!newUser
    };
  };

  static changePasswordService = async ({ email, oldPassword, newPassword }) => {
    const foundUser = await UserClass.findByEmail({ email });

    if (!foundUser) throw new BadRequestError('Email not exists');

    const match = await compare(oldPassword, foundUser.password);

    if (!match) throw new BadRequestError('Old password not match');

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await foundUser.updateOne({ $set: { password: passwordHash } });

    return { changePassword: true };
  };

  static forgotPasswordService = async ({ email }) => {
    const foundUser = await UserClass.checkExist({ email });

    if (!foundUser) throw new BadRequestError('Email not exists');

    const code = storeCache(email);

    sendMailForgotPassword(email, code);

    return { codeSent: true };
  };

  static verifyCodeService = async ({ email, code }) => {
    const foundCode = cache.get(email);

    if (!foundCode) throw new BadRequestError('Code not exists');

    if (foundCode.verified) throw new BadRequestError('Code already verified');

    if (foundCode.code !== code) throw new BadRequestError('Code not match');

    if (foundCode.expireAt < Date.now()) throw new BadRequestError('Code expired');

    cache.set(email, { ...foundCode, verified: true });

    return { verified: true };
  };

  static resetPasswordService = async ({ email, password }) => {
    const foundCode = cache.get(email);

    if (!foundCode) throw new BadRequestError('Code not exists');

    if (!foundCode.verified) throw new BadRequestError('Code already verified');

    if (foundCode.expireAt < Date.now()) throw new BadRequestError('Code expired');

    const foundUser = await UserClass.findByEmail({ email });
    if (!foundUser) throw new BadRequestError('Email not exists');

    const passwordHash = await bcrypt.hash(password, 10);

    await foundUser.updateOne({ $set: { password: passwordHash } });

    cache.del(email);

    return { resetPassword: true };
  };

  static async checkVerifyService({ email }) {
    const foundCode = cache.get(email);

    if (!foundCode) throw new BadRequestError('Code not exists');

    if (foundCode.verified) throw new BadRequestError('Code already verified');

    if (foundCode.expireAt < Date.now()) throw new BadRequestError('Code expired');

    return { verified: true };
  }

  static async checkResetService({ email }) {
    const foundCode = cache.get(email);

    if (!foundCode) throw new BadRequestError('Code not exists');

    if (!foundCode.verified) throw new BadRequestError('Code not verified');

    if (foundCode.expireAt < Date.now()) throw new BadRequestError('Code expired');

    return { verified: true };
  }

  static getTokenRepoGithub = async ({ code }) => {
    const URL = 'https://github.com/login/oauth/access_token';
    const options = {
      client_id: process.env.GITHUB_REPO_OAUTH_CLIENT_ID,
      client_secret: process.env.GITHUB_REPO_OAUTH_CLIENT_SECRET,
      code: code
    };

    const queryString = stringify(options);

    const { data } = await axios.post(`${URL}?${queryString}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessTokenGitHub = parse(data).access_token;

    return {
      accessTokenGitHub
    };
  };
}

export default AuthService;
