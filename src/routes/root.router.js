'use strict';

const express = require('express');
const router = express.Router();
const authRouter = require('./auth.router');
const userRouter = require('./user.router');
const postRouter = require('./post.router');
const CommentRouter = require('./comment.router');
const NotiRouter = require('./notification.router');
const ChatRouter = require('./chat.router');
const TestRouter = require('../test/test');
const { checkApiKey, checkPermission } = require('../auth/checkAuth');
const { pushToLogDiscord } = require('../middlewares/logger.middleware');
const { authentication } = require('../auth/authUtils');
const { pusherServer } = require('../configs/pusher');

// online user
router.post('/pusher/auth', authentication, async (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const presenceData = {
    user_id: req.user.userId
  };
  const auth = await pusherServer.authorizeChannel(
    socketId,
    channel,
    presenceData
  );
  res.send(auth);
});

// add log to discord
router.use(pushToLogDiscord);

// check apiKey
router.use(checkApiKey);

// check permission
router.use(checkPermission('0000'));

router.use('/auth', authRouter);
router.use('/chat', ChatRouter);
router.use('/notifications', NotiRouter);
router.use('/comments', CommentRouter);
router.use('/posts', postRouter);
router.use('/users', userRouter);
router.use('/test', TestRouter);

module.exports = router;
