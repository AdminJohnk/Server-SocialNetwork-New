'use strict';

const express = require('express');
const router = express.Router();
const limiter = require('../middlewares/preventSpam');
const authRouter = require('./auth.router');
const userRouter = require('./user.router');
const postRouter = require('./post.router');
const CommentRouter = require('./comment.router');
const NotiRouter = require('./notification.router');
const ChatRouter = require('./chat.router');
const CommunityRouter = require('./community.router');
const ImageRouter = require('./image.router');
const AdminRouter = require('./admin.router');
const { checkApiKey, checkPermission } = require('../auth/checkAuth');
const { pushToLogDiscord } = require('../middlewares/logger.middleware');

// add log to discord
// router.use(pushToLogDiscord);

// check apiKey
// router.use(checkApiKey);

// check permission
// router.use(checkPermission('0000'));

router.use('/auth', authRouter);
router.use('/admin', AdminRouter);
router.use('/images', ImageRouter);
router.use('/communities', CommunityRouter);
router.use('/chat', ChatRouter);
router.use('/notifications', NotiRouter);
router.use('/comments', CommentRouter);
router.use('/posts', postRouter);
router.use('/users', userRouter);

module.exports = router;
