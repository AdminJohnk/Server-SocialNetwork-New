import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import router from './routes/root.router.js';

const app = express();

// init middleware
app.use(morgan('dev'));
app.use(helmet({ contentSecurityPolicy: { directives: { 'script-src': ["'self'", "'unsafe-inline'"] } } }));
app.use(compression());
app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  })
);

// init routes
app.use('/api/v1', router);

// Hello world
app.get('/', (_, res) => {
  res.send('Hello world');
});

// handling error
app.use((_, __, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, _, res, __) => {
  console.log(`error::`, error);
  const status = error.status || 500;
  return res.status(status).json({
    status: status,
    stack: error.stack,
    message: error.message || 'Internal Server Error'
  });
});

export default app;
