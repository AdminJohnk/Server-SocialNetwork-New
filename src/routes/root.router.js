'use strict';

const express = require('express');
const router = express.Router();
const authRouter = require('./auth.router');
const { checkApiKey,checkPermission } = require('../auth/checkAuth');

// check apiKey
// router.use(checkApiKey);

// check permission
// router.use(checkPermission('0000'));

router.use(authRouter);

module.exports = router;