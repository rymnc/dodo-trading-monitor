import { createNodeRedisClient, WrappedNodeRedisClient } from "handy-redis";
import fp from 'fastify-plugin'

interface RedisOptions {}

export default fp<RedisOptions>(async(fastify, opts) => {
    if(!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
        throw new Error('[Redis] REDIS_HOST and REDIS_PORT must be in env')
    }
    const client = createNodeRedisClient({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    })
    fastify.decorate("redis", client)
})

declare module "fastify" {
    export interface FastifyInstance {
        redis: WrappedNodeRedisClient
    }
}
