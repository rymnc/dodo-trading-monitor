import {
  WebSocketProvider,
  AlchemyWebSocketProvider,
  InfuraWebSocketProvider,
  FallbackProvider,
} from "@ethersproject/providers";
import { BigNumberish } from "ethers";
import { EventTypes } from "../types";

export type EthersEvent = [index: string];

export interface SubscribePayload {
  address: string;
  type: EventTypes;
  abi: any[];
  eventName: string;
  eventField: string;
  triggerValue: BigNumberish;
}

export type Providers =
  | WebSocketProvider
  | AlchemyWebSocketProvider
  | InfuraWebSocketProvider
  | FallbackProvider;

export interface EthConstructor {
  provider: Providers;
  etherscanKey?: string;
  id: number;
}
