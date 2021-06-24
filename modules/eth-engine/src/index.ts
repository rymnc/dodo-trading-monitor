import { config } from "dotenv";
config();
import { EthMq } from "./monitor";
import { memoize } from "lodash";
import { EthSource } from "@dodo/trading-monitor";
import { WebSocketProvider } from "@ethersproject/providers";
import { MqSink } from "./monitor/mqSink";
import { SubscribePayload, payloadValidator } from "@dodo/trading-monitor";
import { getRedis } from "./monitor/redis";
import { EventEmitter } from "events";

async function getProvider(url: string): Promise<WebSocketProvider> {
  return await new Promise((resolve, reject) => {
    let tries: number = 0;
    const interval = setInterval(() => {
      const errorCatcher = new EventEmitter();
      tries++;
      const provider = new WebSocketProvider(url);
      /**
       * Polyfill ethers.js websocket handlers for robustness
       */
      provider._websocket.onopen = () => {
        provider._wsReady = true;
        resolve(provider);
        clearInterval(interval);
        Object.keys(provider._requests).forEach((id) => {
          provider._websocket.send(provider._requests[id].payload);
        });
      };
      provider._websocket.onerror = () => {
        errorCatcher.emit("error");
        provider.destroy();
      };
      errorCatcher.on("error", () => {
        if (tries > 4) {
          reject("Could not connect to the Eth Node");
          clearInterval(interval);
        }
        console.error(
          "Could not connect to the Eth Node. Retrying in 5 seconds."
        );
      });
    }, 5000);
  });
}

/**
 * Memoizes the eth source getter
 */
const getEthSource = memoize(async (): Promise<EthSource> => {
  if (process.env.WEBSOCKET_URL) {
    try {
      const provider = await getProvider(process.env.WEBSOCKET_URL);
      return new EthSource({ id: 0, provider });
    } catch (e: any) {
      throw new Error(e.message);
    }
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
  let source: EthSource;
  try {
    source = await getEthSource();
  } catch (_) {
    throw new Error("Could not connect to the Eth Node");
  }

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
          console.log("Subscribing to :", messageBody.address);
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
  console.log(source.provider);
}

main()
  .then(() => console.log("Initialized Eth Engine"))
  .catch((e) => console.error(e.message));
