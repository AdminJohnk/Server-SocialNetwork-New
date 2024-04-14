'use strict';

import {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError
} from '../core/error.response.js';
import { UserClass } from '../models/user.model.js';
import { RoleUser } from '../utils/constants.js';

const checkIsAdmin = async (req, res, next) => {
  const { userId } = req.user;

  const foundUser = await UserClass.checkExist({ _id: userId });

  if (!foundUser.role.includes(RoleUser.ADMIN)) {
    throw new ForbiddenError('You are not Admin');
  }

  next();
};

export { checkIsAdmin };
