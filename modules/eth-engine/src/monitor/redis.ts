import RedisClient, { Redis } from "ioredis";

export const getRedis = (): Redis => {
  return new RedisClient({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });
};
