'use strict';

import { OK } from '../core/success.response.js';
import HashTagService from '../services/hashtag.service.js';

class HashTagController {
  static getAllHashtags = async (req, res, next) => {
    new OK({
      message: 'Get All Hashtags Successfully',
      metadata: await HashTagService.getAllHashTags({
        ...req.query
      })
    }).send(res);
  };
}

export default HashTagController;
