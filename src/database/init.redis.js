import Redis from 'ioredis';
import { objectConnectRedis } from '../utils/constants.js';

const connectString = `rediss://${objectConnectRedis.username}:${objectConnectRedis.password}@${objectConnectRedis.host}:${objectConnectRedis.port}`;

export const redis = new Redis(connectString);
