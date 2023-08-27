'use strict';

const AuthService = require('../services/auth.service');

class AuthController {
  static signUp = async (req, res, next) => {
    try {
      const result = await AuthService.signUpService(req);
      const { code } = result;

      res.status(code).json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AuthController;