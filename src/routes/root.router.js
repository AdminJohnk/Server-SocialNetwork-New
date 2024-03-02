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
const SearchLogRouter = require('./searchLog.router');
const AdminRouter = require('./admin.router');
const { checkApiKey, checkPermission } = require('../auth/checkAuth');
const { pushToLogDiscord } = require('../middlewares/logger.middleware');

// add log to discord
// router.use(pushToLogDiscord);

// check apiKey
// router.use(checkApiKey);

// check permission
// router.use(checkPermission('0000'));

router.use('/auth', limiter, authRouter);
router.use('/admin', limiter, AdminRouter);
router.use('/images', limiter, ImageRouter);
router.use('/communities', limiter, CommunityRouter);
router.use('/chat', limiter, ChatRouter);
router.use('/notifications', limiter, NotiRouter);
router.use('/comments', limiter, CommentRouter);
router.use('/posts', limiter, postRouter);
router.use('/users', limiter, userRouter);
router.use('/searchlog', limiter, SearchLogRouter);

module.exports = router;
