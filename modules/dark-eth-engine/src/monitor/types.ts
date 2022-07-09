import { EthSource } from "@dodo/trading-monitor";

import { Libp2pSink } from "./libp2pSink";

export interface EthLibp2pConstructor<Libp2pData> {
  source: EthSource;
  sink: Libp2pSink<Libp2pData>;
}