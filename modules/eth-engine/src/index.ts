import { config } from "dotenv";
config();
import { EthMq } from "./monitor";
import { memoize } from "lodash";
import { EthSource } from "@dodo/trading-monitor";
import { WebSocketProvider } from "@ethersproject/providers";
import { MqSink } from "./monitor/mqSink";
import { SubscribePayload, payloadValidator } from "@dodo/trading-monitor";

const getEthSource = memoize((): EthSource => {
  if (process.env.WEBSOCKET_URL) {
    const provider = new WebSocketProvider(process.env.WEBSOCKET_URL);
    return new EthSource({ id: 0, provider });
  } else {
    throw new Error("[EthSource] WEBSOCKET_URL must be defined in env");
  }
});

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

async function main() {
  const source = getEthSource();
  const sink = getMqSink();
  const ethMq = new EthMq({ source, sink });
  const redisConnection = sink.client.nodeRedis;
  await redisConnection.subscribe("eth-engine");
  redisConnection.on("message", (_: string, message: string) => {
    try {
      const messageBody: SubscribePayload = JSON.parse(message);
      if(payloadValidator(messageBody)) {
        ethMq.run(messageBody);
      } else {
        throw new Error()
      }
    } catch (e) {
      console.error("[Main] received invalid subscribe request");
    }
  });
}

const runner = () => {
  main().catch(console.error).then(runner);
};
