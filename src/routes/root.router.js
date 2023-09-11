'use strict';

const express = require('express');
const router = express.Router();
const authRouter = require('./auth.router');
const userRouter = require('./user.router');
const postRouter = require('./post.router');
const { checkApiKey, checkPermission } = require('../auth/checkAuth');

// check apiKey
router.use(checkApiKey);

// check permission
router.use(checkPermission('0000'));

router.use('/posts', postRouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);

module.exports = router;
