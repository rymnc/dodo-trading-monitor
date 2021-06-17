import { FastifyPluginAsync } from "fastify";
import { ReceiveMessage, SendMessage, isValid, now, SendType } from "./schemas";

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", { websocket: true }, (conn, request) => {
    const { socket } = conn;
    const send = async (socket: any, payload: string | any, type: SendType) => {
      const slug: SendMessage = {
        timestamp: now(),
        type,
      };
      if (type === "update") slug.data = payload;
      if (type === "error") slug.error = payload;
      return socket.send(JSON.stringify(slug));
    };
    socket.on("message", async (m: string) => {
      let msg: ReceiveMessage;
      try {
        msg = JSON.parse(m);
      } catch (e) {
        send(socket, "invalid json", "error");
        return;
      }
      const validate: string | boolean = isValid(msg);
      if (validate !== true) {
        await send(socket, validate, "error");
      } else {
        switch (msg.type) {
          case "subscribe": {
            // TODO
            break;
          }
          case "unsubscribe": {
            // TODO
            break;
          }
          case "ping": {
            // TODO
            break;
          }
          case "pong": {
            // TODO
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
