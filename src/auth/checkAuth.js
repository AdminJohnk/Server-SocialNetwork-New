'use strict';

import { ApiKeyClass } from '../models/apiKey.model.js';
import { HEADER } from '../utils/constants.js';

const checkApiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: 'Forbidden Error'
      });
    }
    // check objKey
    const objKey = await ApiKeyClass.findByID(key);
    if (!objKey) {
      return res.status(403).json({
        message: 'Forbidden Error'
      });
    }

    req.objKey = objKey;
    return next();
  } catch (error) {
    console.log(error.message);
    return;
  }
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({
        message: 'Permission denied'
      });
    }

    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({
        message: 'Permission denied'
      });
    }
    return next();
  };
};

export { checkApiKey, checkPermission };
