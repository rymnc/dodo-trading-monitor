import { join } from "path";
// @ts-ignore invalid import, but it's a plugin
import AutoLoad, { AutoloadPluginOptions } from "fastify-autoload";
import { FastifyPluginAsync } from "fastify";
import {} from "fastify-websocket";

export type AppOptions = {} & Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });
  void fastify.register(require("fastify-websocket"), {
    options: { maxPayload: 1048576 },
  });
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });
};

export default app;
export { app };
