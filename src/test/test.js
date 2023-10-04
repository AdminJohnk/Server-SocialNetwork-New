'use strict';
const express = require('express');
const router = express.Router();
const NotiController = require('../controllers/notification.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const { authentication } = require('../auth/authUtils');

// Authentication
router.use(authentication);

router.get('', (req, res, next) => {
    res.status(200).send('Hello world')
});

module.exports = router;
