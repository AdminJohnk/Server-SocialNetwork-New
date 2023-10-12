const express = require('express');
const app = express();
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { checkOverLoad } = require('./helpers/check.connect');
const router = require('./routes/root.router');

// init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  cors({
    // origin: 'http://localhost:3000',
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  })
);
app.use(
  express.urlencoded({
    extended: true
  })
);

// init db
require('./database/init.mongodb');

// init redis
// require("./services/redisPubSub.service")
// require("./services/redis.service")

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
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    stack: error.stack,
    message: error.message || 'Internal Server Error'
  });
});

module.exports = app;
