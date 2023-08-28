'use strict';

const AuthService = require('../services/auth.service');
const { OK, CREATED } = require('../core/success.response');

class AuthController {
  static signUp = async (req, res, next) => {
    new CREATED({
      message: 'Sign Up Successfully',
      metadata: await AuthService.signUpService(req.body)
    }).send(res);
  };
  static login = async (req, res, next) => {
    new OK({
      message: 'Login Successfully',
      metadata: await AuthService.LoginService(req.body)
    }).send(res);
  };
  static logout = async (req, res, next) => {
    new OK({
      message: 'Logout Successfully',
      metadata: await AuthService.logoutService(req.keyStore)
    }).send(res);
  };
}

module.exports = AuthController;
