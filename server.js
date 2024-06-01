import 'dotenv/config';
import { SenderMailServer } from './src/configs/mailTransport.js';
import app from './src/app.js';

// init db
import './src/database/init.mongodb.js';

// init mail service
SenderMailServer();

// init rabbitmq
import { connectToRabbitMQ } from './src/database/init.rabbit.js';
connectToRabbitMQ().then(({ channel, connection }) => {
  console.log('Connected to RabbitMQ');
  global.__channel = channel;
  global.__connection = connection;
});

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
