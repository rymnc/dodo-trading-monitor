import { EthSource } from "@dodo/trading-monitor";
import { MqSink } from "./mqSink";

/**
 * Interface for the Eth-Email Monitor's constructor
 */
export interface EthMqConstructor {
  source: EthSource;
  sink: MqSink;
}
