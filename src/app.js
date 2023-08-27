const express = require('express');
const app = express();
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const {checkOverLoad} = require('./helpers/check.connect');
const router = require('./routes/root.router');

// init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

// init db
require('./database/init.mongodb');
// checkOverLoad();

// init routes
app.use('/api/v1', router);

// handling error

module.exports = app;