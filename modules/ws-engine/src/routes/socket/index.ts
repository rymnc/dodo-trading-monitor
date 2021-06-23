import { FastifyPluginAsync } from "fastify";
import { ReceiveMessage, SendMessage, isValid, now, SendType } from "./schemas";
import hash from "object-hash";
import { getRedis } from "../../plugins/redis";

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", { websocket: true }, (conn, request) => {
    const { socket } = conn;
    const send = async (socket: any, payload: string | any, type: SendType) => {
      const slug: SendMessage = {
        timestamp: now(),
        type,
      };
      if (type === "update") {
        slug.data = payload.data;
        slug.channel = payload.channel ?? "heartbeat";
      }
      if (type === "error") slug.error = payload;
      return socket.send(JSON.stringify(slug));
    };
    socket.on("message", async (m: string) => {
      let msg: ReceiveMessage;
      try {
        msg = JSON.parse(m);
      } catch (e) {
        await send(socket, "invalid json", "error");
        return;
      }
      const validate: string | boolean = isValid(msg);
      if (validate !== true) {
        await send(socket, validate, "error");
      } else {
        switch (msg.type) {
          case "subscribe": {
            if (msg.channel) {
              const payloadHash = hash(msg.channel);
              const redis = getRedis(payloadHash);
              const status = await redis.subscribe(payloadHash);
              if (status) {
                await fastify.redis.publish(
                  "eth-engine-sub",
                  JSON.stringify(msg.channel)
                );
                await send(
                  socket,
                  { data: "subscribed", channel: payloadHash },
                  "update"
                );
                redis.on("message", async (channel, message) => {
                  if (channel === payloadHash) {
                    await send(
                      socket,
                      { ...JSON.parse(message), channel: payloadHash },
                      "update"
                    );
                  }
                });
              } else {
                await send(socket, "could not subscribe to events", "error");
              }
            }
            break;
          }
          case "unsubscribe": {
            if (msg.channel) {
              const payloadHash = hash(msg.channel);
              const redis = getRedis(payloadHash);
              const status = await redis.unsubscribe(payloadHash);
              if (status) {
                await fastify.redis.publish(
                  "eth-engine-unsub",
                  JSON.stringify(msg.channel)
                );
                await send(socket, { data: "unsubscribed" }, "update");
              } else {
                await send(socket, `invalid subscription`, "error");
              }
            }
            break;
          }
          case "ping": {
            await send(socket, { data: "ping_ack" }, "update");
            break;
          }
          case "pong": {
            await send(socket, { data: "pong_ack" }, "update");
            break;
          }
          default: {
            await send(socket, "Unknown Message Type", "error");
          }
        }
      }
    });
  });
};

export default example;
