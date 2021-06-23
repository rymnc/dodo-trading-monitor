import { config } from "dotenv";
config();
import { EthMq } from "./monitor";
import { memoize } from "lodash";
import { EthSource } from "@dodo/trading-monitor";
import { WebSocketProvider } from "@ethersproject/providers";
import { MqSink } from "./monitor/mqSink";
import { SubscribePayload, payloadValidator } from "@dodo/trading-monitor";
import { getRedis } from "./monitor/redis";

/**
 * Memoizes the eth source getter
 */
const getEthSource = memoize((): EthSource => {
  if (process.env.WEBSOCKET_URL) {
    const provider = new WebSocketProvider(process.env.WEBSOCKET_URL);
    return new EthSource({ id: 0, provider });
  } else {
    throw new Error("[EthSource] WEBSOCKET_URL must be defined in env");
  }
});

/**
 * Memoizes the mq sink getter
 */
const getMqSink = memoize((): MqSink => {
  if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
    return new MqSink({
      id: 1,
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });
  } else {
    throw new Error(
      "[MqSink] REDIS_HOST and REDIS_PORT must be defined in env"
    );
  }
});

/**
 * Entrypoint
 */
async function main() {
  const source = getEthSource();
  const sink = getMqSink();
  console.log("Initialized Source and Sink");
  const ethMq = new EthMq({ source, sink });
  const redisConnection = getRedis();
  redisConnection.on("error", (e) => console.error(e));
  console.log("Initialized Redis Connection");
  try {
    await redisConnection.subscribe("eth-engine-sub", "eth-engine-unsub");
  } catch (e) {
    console.error(e);
  }
  console.log("Subscribed to relevant channels");
  redisConnection.on("message", (channel: string, message: string) => {
    try {
      const messageBody: SubscribePayload = JSON.parse(message);
      /**
       * Validate the message received via redis pubsub
       */
      if (payloadValidator(messageBody)) {
        if (channel === "eth-engine-sub") {
          console.log("Subscribing to :", messageBody);
          ethMq.run(messageBody);
        } else {
          ethMq.source.unsubscribe(messageBody);
        }
      } else {
        throw new Error();
      }
    } catch (e) {
      console.error("[Main] received invalid subscribe request");
    }
  });
}

main()
  .catch((e) => console.error(e))
  .then(() => console.log("Initialized Eth Engine"));
