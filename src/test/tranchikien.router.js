'use strict';
const express = require('express');
const router = express.Router();
const TranChiKienClass = require('../test/tranchikien.test');

router.get('/subscribe', async (req, res) => {
  await TranChiKienClass.subscribe({
    channel: 'tranchikien entertainment',
    callback: (channel, message) => {
        console.log('channel::', channel);
        console.log('message::', message);
    }
  });
  res.send('Subcribe successfully');
});
router.get('/publish', async (req, res) => {
  await TranChiKienClass.publish('tranchikien entertainment', 'Hello world');
  res.send('Publish successfully');
});

module.exports = router;
