const PusherServer = require('pusher');
// const PusherClient = require('pusher-js');

const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'ap1',
  useTLS: true,
});

module.exports = { pusherServer };
