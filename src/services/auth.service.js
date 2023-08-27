'use strict';
const UserModel = require('../models/user.model');
const KeyTokenModel = require('../models/keytoken.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const {
  BadRequestError,
  ConflicRequestError
} = require('../core/error.response');

class AuthService {
  static signUpService = async ({ name, email, password }) => {
    // check Email exist
    const holderUser = await UserModel.findByEmail({ email });
    if (holderUser) throw new BadRequestError('Error: Email already exists');

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await UserModel.createUser({
      name,
      email,
      password: passwordHash
    });

    if (newUser) {
      // create privateKey, publicKey
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

      // const privateKey = crypto.randomBytes(64).toString('hex');
      // const publicKey = crypto.randomBytes(64).toString('hex');

      const keyStore = await KeyTokenModel.createKeyToken({
        userId: newUser._id,
        publicKey,
        privateKey
      });

      if (!keyStore) throw new BadRequestError('Error: Cant create keyStore!');

      // create token pair
      const tokens = await createTokenPair(
        { userId: newUser._id, email },
        publicKey,
        privateKey
      );
      console.log(`Create Token Success:`, tokens);

      return {
        shop: getInfoData({
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
