import RedisClient, { Redis } from "ioredis";

/**
 * Getter for redis instances
 * @returns Redis
 */
export const getRedis = (): Redis => {
  return new RedisClient({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });
};
