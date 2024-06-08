'use strict';

import { Router } from 'express';
const router = Router();
import authRouter from './auth.router.js';
import userRouter from './user.router.js';
import postRouter from './post.router.js';
import CommentRouter from './comment.router.js';
import NotiRouter from './notification.router.js';
import ChatRouter from './chat.router.js';
import CommunityRouter from './community.router.js';
import ImageRouter from './image.router.js';
import SearchLogRouter from './searchLog.router.js';
import AdminRouter from './admin.router.js';
import SeriesRouter from './series.router.js';
import QuestionRouter from './question.router.js';
import HashtagRouter from './hashtag.router.js';
import { checkApiKey, checkPermission } from '../auth/checkAuth.js';
import { pushToLogDiscord } from '../middlewares/logger.middleware.js';

// add log to discord
router.use(pushToLogDiscord);

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
router.use('/searchlog', SearchLogRouter);
router.use('/series', SeriesRouter);
router.use('/questions', QuestionRouter);
router.use('/hashtags', HashtagRouter);

export default router;
