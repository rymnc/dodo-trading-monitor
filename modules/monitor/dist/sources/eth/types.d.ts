import { WebSocketProvider, AlchemyWebSocketProvider, InfuraWebSocketProvider, FallbackProvider } from "@ethersproject/providers";
import { BigNumberish } from "ethers";
import { EventTypes } from "../types";
import { Result } from "@ethersproject/abi";
import { Registry } from "../../registry/types";
export declare type EthersEvent = Result;
export interface CommonPayload {
    address: string;
    abi: any[];
    eventName: string;
}
export interface Constraints {
    type: EventTypes;
    eventField: string;
    triggerValue: BigNumberish;
}
export interface SubscribePayload {
    address: string;
    abi: any[];
    type: EventTypes;
    triggerValue: BigNumberish;
    label: string;
}
export declare const payloadValidator: (p: any) => boolean;
export declare type Providers = WebSocketProvider | AlchemyWebSocketProvider | InfuraWebSocketProvider | FallbackProvider;
export interface EthConstructor {
    provider: Providers;
    registry: Registry;
    id: number;
}
