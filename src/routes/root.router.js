'use strict';

const express = require('express');
const router = express.Router();
const authRouter = require('./auth.router');
const userRouter = require('./user.router');
const postRouter = require('./post.router');
const CommentRouter = require('./comment.router');
const { checkApiKey, checkPermission } = require('../auth/checkAuth');
const { pushToLogDiscord } = require('../middlewares/logger.middleware');

// add log to discord
router.use(pushToLogDiscord);

// check apiKey
router.use(checkApiKey);

// check permission
router.use(checkPermission('0000'));

// const tranchikienRouter = require('../test/tranchikien.router');
// router.use('/tranchikien', tranchikienRouter);
router.use('/comments', CommentRouter);
router.use('/posts', postRouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);

module.exports = router;
