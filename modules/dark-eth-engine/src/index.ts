import { EthLibp2p } from "./monitor";
import { memoize } from "lodash";
import { EthSource } from "@dodo/trading-monitor";
import {
  getProvider
} from '@dodo/trading-monitor/dist/sources'
import { Libp2pSink } from "./monitor/libp2pSink";
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

import { RedisRegistry } from '../../eth-engine/src/monitor/redisRegistry'
import { SubscribePayload, payloadValidator } from "@dodo/trading-monitor";
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

import hash from "object-hash";

//temp
interface GossipSubMsg {
  detail: {
    data: Uint8Array
    topic: string;

  };
}


/**
 * Memoizes the eth source getter
 */
const getEthSource = memoize(async (): Promise<EthSource> => {
  if (process.env.WEBSOCKET_URL) {
    try {
      const provider = await getProvider(process.env.WEBSOCKET_URL);
      const registry = new RedisRegistry({ id: 2 });
      return new EthSource({ id: 0, provider, registry });
    } catch (e: any) {
      throw new Error(e.message);
    }
  } else {
    throw new Error("[EthSource] WEBSOCKET_URL must be defined in env");
  }
});

/**
 * Memoizes the libp2p node getter
 */
const getLibp2pSink = memoize((): Libp2pSink<any> => {
  return new Libp2pSink({
    id: 1,
  });
});

/**
 * Entrypoint
 */
async function main() {
  let source: EthSource;
  try {
    source = await getEthSource();
  } catch (e) {
    console.error(e);
    throw new Error("Could not connect to the Eth Node");
  }

  const sink = getLibp2pSink();
  await sink.init();
  console.log("Initialized Source and Sink");
  const ethMq = new EthLibp2p({ source, sink });
  console.log("Initialized Redis Connection");
  try {
    sink.node.pubsub.subscribe("dark-eth-engine-sub");
  } catch (e) {
    console.error(e);
  }
  console.log("Subscribed to relevant channels");
  sink.node.pubsub.on("message", async (message: GossipSubMsg) => {
    try {
      const uint8ParsedString = uint8ArrayToString(message.detail.data);
      const messageBody: SubscribePayload = JSON.parse(uint8ParsedString);
      /**
       * Validate the message received via gossipsub
       */
      if (payloadValidator(messageBody)) {
        if (message.detail.topic === "dark-eth-engine-sub") {
          console.log("Subscribing to :", messageBody.address);
          const toChannel = hash(messageBody);
          try {
            await ethMq.run(messageBody);
          } catch (e: any) {
            await sink.node.pubsub.publish(
              toChannel,
              uint8ArrayFromString(
                JSON.stringify({ error: true, reason: e.message })
              )
            );
          }
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
  .then(() => console.log("Initialized Dark Eth Engine"))
  .catch((e) => console.error(e.message));
