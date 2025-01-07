import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const value = await redis.get('key')
console.log(value)
export default redis;
