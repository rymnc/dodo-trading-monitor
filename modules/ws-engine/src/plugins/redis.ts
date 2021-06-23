import RedisClient, { Redis } from "ioredis";
import fp from "fastify-plugin";
import { memoize } from "lodash";

interface RedisOptions {}

export const getRedis = memoize((key: string): Redis => {
  return new RedisClient({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });
});

export default fp<RedisOptions>(async (fastify, opts) => {
  if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
    throw new Error("[Redis] REDIS_HOST and REDIS_PORT must be in env");
  }
  const client = getRedis("default");
  fastify.decorate("redis", client);
});

declare module "fastify" {
  export interface FastifyInstance {
    redis: Redis;
  }
}
