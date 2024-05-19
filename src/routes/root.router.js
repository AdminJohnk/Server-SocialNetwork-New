'use strict';

import { Router } from 'express';
const router = Router();
import limiter from '../middlewares/preventSpam.js';
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
import { checkApiKey, checkPermission } from '../auth/checkAuth.js';
import { pushToLogDiscord } from '../middlewares/logger.middleware.js';

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
router.use('/series', limiter, SeriesRouter);
router.use('/questions', limiter, QuestionRouter);

export default router;
