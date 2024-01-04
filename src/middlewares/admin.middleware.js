'use strict';

const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} = require('../core/error.response');
const { UserClass } = require('../models/user.model');
const { RoleUser } = require('../utils/constants');

const checkIsAdmin = async (req, res, next) => {
  const { userId } = req.user;

  const foundUser = await UserClass.checkExist({ _id: userId });

  if (!foundUser.role.includes(RoleUser.ADMIN)) {
    throw new ForbiddenError('You are not Admin');
  }

  next();
};

module.exports = { checkIsAdmin };
