const express = require('express');
const app = express();
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const router = require('./routes/root.router');

// init middleware
app.use(morgan('dev'));
app.use(helmet(/* { contentSecurityPolicy: { directives: { 'script-src': ["'self'", "'unsafe-inline'"] } } } */));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  })
);
app.use(
  express.urlencoded({
    extended: true
  })
);

// init routes
app.use('/api/v1', router);

// Hello world
app.get('/', (req, res) => {
  res.send('Hello world');
});

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
