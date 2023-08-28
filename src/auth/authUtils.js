'use strict';

const JWT = require('jsonwebtoken');
const { asyncHandler } = require('../helpers/asyncHandler');
const KeyTokenModel = require('../models/keytoken.model');
const { AuthFailureError, NotFoundError } = require('../core/error.response');

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization'
};

const authentication = asyncHandler(async (req, res, next) => {
  /*
  1 - Check userId missing
  2 - get accessToken
  3 - verifyToken
  4 - check user in bds?
  5 - check keyStore with this userId
  6 - OK all => return next()
  */

  // 1 - Check userId missing
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError('Invalid Request');

  // 2 - get accessToken
  const keyStore = await KeyTokenModel.findByUserId(userId);
  if (!keyStore) throw new NotFoundError('Not found keyStore');

  // 3 - verifyToken
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError('Invalid Request');

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError('Invalid UserId');
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
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
        console.log(`decode verify::`, decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log('error: ', error.message);
    return error;
  }
};

module.exports = {
  createTokenPair,
  authentication
};
