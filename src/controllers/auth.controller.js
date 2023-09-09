'use strict';

const AuthService = require('../services/auth.service');
const { OK, CREATED } = require('../core/success.response');

class AuthController {
  static handleRefreshToken = async (req, res, next) => {
    new OK({
      message: 'Refresh Token Successfully',
      metadata: await AuthService.handleRefreshToken({
        refreshToken: req.refreshToken,
        keyStore: req.keyStore,
        user: req.user
      })
    }).send(res);
  };

  static logout = async (req, res, next) => {
    new OK({
      message: 'Logout Successfully',
      metadata: await AuthService.logoutService(req.keyStore)
    }).send(res);
  };

  static login = async (req, res, next) => {
    new OK({
      message: 'Login Successfully',
      metadata: await AuthService.loginService(req.body)
    }).send(res);
  };
  
  static signUp = async (req, res, next) => {
    console.log('req.body', req.body)
    new CREATED({
      message: 'Sign Up Successfully',
      metadata: await AuthService.signUpService(req.body)
    }).send(res);
  };
}

module.exports = AuthController;
