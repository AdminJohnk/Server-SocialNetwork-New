'use strict';

const express = require('express');
const router = express.Router();
const authRouter = require('./auth.router');
const userRouter = require('./user.router');
const followRouter = require('./follow.router');
const { checkApiKey, checkPermission } = require('../auth/checkAuth');

// check apiKey
router.use(checkApiKey);

// check permission
router.use(checkPermission('0000'));

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/follow', followRouter);

module.exports = router;
