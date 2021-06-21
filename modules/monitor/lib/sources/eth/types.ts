import {
  WebSocketProvider,
  AlchemyWebSocketProvider,
  InfuraWebSocketProvider,
  FallbackProvider,
} from "@ethersproject/providers";
import { BigNumberish } from "ethers";
import { EventTypes } from "../types";
import { Result } from "@ethersproject/abi";

export type EthersEvent = Result;

/**
 * Subscription Payload for the Event
 */
export interface SubscribePayload {
  address: string;
  type: EventTypes;
  abi: any[];
  eventName: string;
  eventField: string;
  triggerValue: BigNumberish;
  label: string;
}

/**
 * For realtime access, only websocket providers must be allowed
 */
export type Providers =
  | WebSocketProvider
  | AlchemyWebSocketProvider
  | InfuraWebSocketProvider
  | FallbackProvider;

/**
 * Constructor interface for the Eth Source
 */
export interface EthConstructor {
  provider: Providers;
  id: number;
}
