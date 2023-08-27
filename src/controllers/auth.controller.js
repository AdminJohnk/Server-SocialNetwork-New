'use strict';

const AuthService = require('../services/auth.service');
const { OK, CREATED } = require('../core/success.response');

class AuthController {
  static signUp = async (req, res, next) => {
    console.log('req.body', req.body)
    new CREATED({
      message: 'Sign Up Successfully',
      metadata: await AuthService.signUpService(req.body)
    }).send(res);
  };
  static login = async (req, res, next) => {
    new OK({
      message: 'Sign In Successfully',
      metadata: await AuthService.LoginService(req.body)
    }).send(res);
  };
}

module.exports = AuthController;
