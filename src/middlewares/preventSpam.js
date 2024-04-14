import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  skip: (req, res) => {
    // skip method get
    return req.method === 'GET';
  }
});

export default limiter;
