'use strict';

import JWT from 'jsonwebtoken';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { KeyTokenClass } from '../models/keytoken.model.js';
import { AuthFailureError, NotFoundError } from '../core/error.response.js';
import { HEADER } from '../utils/constants.js';

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError('Invalid Request');

  const keyStore = await KeyTokenClass.findByUserId(userId);
  if (!keyStore) throw new NotFoundError('Not found keyStore');

  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN];
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId');
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw new AuthFailureError(error.message);
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError('Invalid Request');

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId');
    req.keyStore = keyStore;
    req.user = decodeUser;
    return next();
  } catch (error) {
    console.log('error-name: ', error.name); // TokenExpiredError
    console.log('error-message: ', error.message); // jwt expired
    throw new AuthFailureError(error.message);
  }
});

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '2 days'
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '7 days'
    });
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify::`, err);
      } else {
        console.log('decode verify::', decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log('error: ', error.message);
    return error;
  }
};

const verifyToken = async (token, keySecret) => {
  try {
    const decodeToken = await JWT.verify(token, keySecret);
    return decodeToken;
  } catch (error) {
    throw error;
  }
};

export { HEADER, createTokenPair, authentication, verifyToken };
