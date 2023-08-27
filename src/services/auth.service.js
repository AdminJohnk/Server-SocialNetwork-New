'use strict';
const UserModel = require('../models/user.model');
const KeyTokenModel = require('../models/keytoken.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');

class AuthService {
  static signUpService = async req => {
    const { name, email, password } = req.body;

    try {
      // check Email exist
      const holderUser = await UserModel.findByEmail({ email });
      if (holderUser) {
        return {
          code: '401',
          message: 'Email already exist',
          status: 'error'
        };
      }

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

        if (!keyStore) {
          return {
            code: 'xxxx',
            message: 'keyStore error'
          };
        }

        // create token pair
        const tokens = await createTokenPair(
          { userId: newUser._id, email },
          publicKey,
          privateKey
        );
        console.log(`Create Token Success:`, tokens);

        return {
          code: 201,
          metadata: {
            user: getInfoData({
              fields: ['_id', 'name', 'email'],
              object: newUser
            }),
            tokens
          }
        };
      }
      return {
        code: 200,
        metadata: null
      };
    } catch (error) {
      return {
        code: '500',
        message: error.message,
        staus: 'error'
      };
    }
  };
}

module.exports = AuthService;
