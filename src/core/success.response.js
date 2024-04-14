'use strict';

import { StatusCodes, ReasonPhrases } from '../utils/httpStatusCode.js';

class SuccessResponse {
  constructor({ message, status = StatusCodes.OK, reasonStatusCode = ReasonPhrases.OK, metadata = {} }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = status;
    this.metadata = metadata;
  }
  send(res, headers = {}) {
    return res.status(this.status).send(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({ message, status = StatusCodes.CREATED, reasonStatusCode = ReasonPhrases.CREATED, metadata }) {
    super({ message, status, reasonStatusCode, metadata });
  }
}

export { OK, CREATED };
