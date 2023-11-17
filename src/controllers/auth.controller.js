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
    new CREATED({
      message: 'Sign Up Successfully',
      metadata: await AuthService.signUpService(req.body)
    }).send(res);
  };

  static forgotPassword = async (req, res, next) => {
    new OK({
      message: 'Forgot Password Successfully',
      metadata: await AuthService.forgotPasswordService(req.body)
    }).send(res);
  };

  static verifyCode = async (req, res, next) => {
    new OK({
      message: 'Verify Code Successfully',
      metadata: await AuthService.verifyCodeService(req.body)
    }).send(res);
  };

  static resetPassword = async (req, res, next) => {
    new OK({
      message: 'Reset Password Successfully',
      metadata: await AuthService.resetPasswordService(req.body)
    }).send(res);
  };

  static checkVerify = async (req, res, next) => {
    new OK({
      message: 'Check Verify Successfully',
      metadata: await AuthService.checkVerifyService(req.body)
    }).send(res);
  };

  static checkReset = async (req, res, next) => {
    new OK({
      message: 'Check Reset Successfully',
      metadata: await AuthService.checkResetService(req.body)
    }).send(res);
  };

  static callbackGithub = async (req, res, next) => {
    new OK({
      message: 'Get Repository Github Successfully',
      metadata: await AuthService.callbackGithub({
        code: req.query.code
      })
    }).send(res);
  };
}

module.exports = AuthController;
