import { Redis } from 'ioredis';
import { objectConnectRedis } from '../utils/constants.js';

const connectString = `rediss://${objectConnectRedis.username}:${objectConnectRedis.password}@${objectConnectRedis.host}:${objectConnectRedis.port}`;

export const redis = new Redis(connectString);

redis.on('connect', () => {
  console.log('Connected to Redis');
});
