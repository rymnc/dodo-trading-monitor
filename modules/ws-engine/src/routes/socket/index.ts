import { FastifyPluginAsync } from "fastify";
import { ReceiveMessage, SendMessage, isValid, now, SendType } from "./schemas";
import hash from "object-hash";
import { getRedis } from "../../plugins/redis";
import WebSocket from "ws";

const socket: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", { websocket: true }, (conn, request) => {
    const { socket } = conn;
    /**
     * Beautifies and sends the payload to the socket
     * @param socket WebSocket
     * @param payload string
     * @param type "update" or "error"
     * @returns void
     */
    const send = async (
      socket: WebSocket,
      payload: string | any,
      type: SendType
    ) => {
      const slug: SendMessage = {
        timestamp: now(),
        type,
      };
      /**
       * If the type is an update, decorate with data and channel
       */
      if (type === "update") {
        slug.data = payload.data;
        slug.channel = payload.channel ?? "heartbeat";
      }
      if (type === "error") slug.error = payload;
      return socket.send(JSON.stringify(slug));
    };
    socket.on("message", async (m: string) => {
      let msg: ReceiveMessage;
      /**
       * Validate JSON
       */
      try {
        msg = JSON.parse(m);
      } catch (e) {
        await send(socket, "invalid json", "error");
        return;
      }
      /**
       * Validate the payload
       */
      const validate: string | boolean = isValid(msg);
      if (validate !== true) {
        await send(socket, validate, "error");
        socket.terminate();
      } else {
        /**
         * Main handler for message types
         */
        switch (msg.type) {
          case "subscribe": {
            if (msg.channel) {
              /**
               * This hash will be used by the eth-engine to publish
               * new events
               */
              const payloadHash = hash(msg.channel);
              /**
               * New redis connection is required for a subscription,
               * but to prevent memory leaks, it is memoized for the same payloadHash
               */
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
                /**
                 * Event handler
                 */
                redis.on("message", async (channel, message) => {
                  if (channel === payloadHash) {
                    const msg = JSON.parse(message);
                    if (msg?.error === true) {
                      await send(socket, msg.reason, "error");
                      socket.terminate();
                    } else {
                      await send(
                        socket,
                        { ...msg, channel: payloadHash },
                        "update"
                      );
                    }
                  }
                });
              } else {
                await send(socket, "could not subscribe to events", "error");
                socket.terminate();
              }
            }
            break;
          }
          case "unsubscribe": {
            if (msg.channel) {
              const payloadHash = hash(msg.channel);
              /**
               * Gets the same redis instance that was used to subscribe
               */
              const redis = getRedis(payloadHash);
              const status = await redis.unsubscribe(payloadHash);
              if (status) {
                await fastify.redis.publish(
                  "eth-engine-unsub",
                  JSON.stringify(msg.channel)
                );
                await send(socket, { data: "unsubscribed" }, "update");
              } else {
                await send(socket, "invalid subscription", "error");
              }
            }
            break;
          }
          case "ping": {
            /**
             * Any arbitrary logic can be placed here to manage pings.
             * Currently it checks for staleness(15 seconds)
             */
            await send(socket, { data: "ping_ack" }, "update");
            break;
          }
          case "pong": {
            await send(socket, { data: "pong_ack" }, "update");
            break;
          }
          default: {
            await send(socket, "Unknown Message Type", "error");
            socket.terminate();
          }
        }
      }
    });
  });
};

export default socket;
