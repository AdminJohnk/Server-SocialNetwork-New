require('dotenv').config();
const { checkOverLoad } = require('./src/helpers/check.connect');
const { SenderMailServer } = require('./src/configs/mailTransport');
const app = require('./src/app');

// init db
require('./src/database/init.mongodb');

// init mail service
SenderMailServer();

// init rabbitmq
const RabbitInit = require('./src/database/init.rabbit');
RabbitInit.connectToRabbitMQ().then(({ channel, connection }) => {
  console.log('Connected to RabbitMQ');
  global.__channel = channel;
  global.__connection = connection;
});

// init redis
// const RedisInit = require('./database/init.redis');
// RedisInit.getInstanceRedis().then(redisClient => {
//   global.__redisClient = redisClient;
// });

// checkOverLoad();

const PORT = process.env.PORT || 3056;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// process.on('SIGINT', () => {
//   server.close(() => {
//     console.log('Exit Server Express');
//   });
// });
