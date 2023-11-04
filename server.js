require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.DEV_APP_PORT || 3056;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// process.on('SIGINT', () => {
//   server.close(() => {
//     console.log('Exit Server Express');
//   });
// });