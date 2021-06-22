import { WebSocketProvider, AlchemyWebSocketProvider, InfuraWebSocketProvider, FallbackProvider } from "@ethersproject/providers";
import { BigNumberish } from "ethers";
import { EventTypes } from "../types";
import { Result } from "@ethersproject/abi";
export declare type EthersEvent = Result;
export interface CommonPayload {
    address: string;
    abi: any[];
    eventName: string;
}
export interface SubscribePayload extends CommonPayload {
    type: EventTypes;
    eventField: string;
    triggerValue: BigNumberish;
    label: string;
}
export declare type Providers = WebSocketProvider | AlchemyWebSocketProvider | InfuraWebSocketProvider | FallbackProvider;
export interface EthConstructor {
    provider: Providers;
    id: number;
}
//# sourceMappingURL=types.d.ts.map