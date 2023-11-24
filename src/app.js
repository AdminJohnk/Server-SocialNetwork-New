const express = require('express');
const app = express();
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { checkOverLoad } = require('./helpers/check.connect');
const router = require('./routes/root.router');
const { SenderMailServer } = require('./configs/mailTransport');

// init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cors({ /*  origin: 'http://localhost:3000', */ credentials: true }));
app.use(express.urlencoded({ extended: true }));

// init db
require('./database/init.mongodb');

// init mail service
SenderMailServer();

// init redis
// const { redisClient } = require('./database/init.redis');
// global.__redisClient = redisClient;

// checkOverLoad();

// init routes
app.use('/api/v1', router);

// handling error
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  console.log(`error::`, error);
  const status = error.status || 500;
  return res.status(status).json({
    status: status,
    stack: error.stack,
    message: error.message || 'Internal Server Error'
  });
});

module.exports = app;
