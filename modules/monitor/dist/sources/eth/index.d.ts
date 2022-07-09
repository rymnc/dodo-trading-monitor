/// <reference types="lodash" />
import { Source, EventReceipts } from "../types";
import { EthConstructor, Providers, SubscribePayload, EthersEvent, CommonPayload, Constraints } from "./types";
import { Contract } from "ethers";
import { Registry } from "../../registry/types";
export declare class EthSource implements Source<SubscribePayload, any> {
    provider: Providers;
    id: number;
    name: string;
    events: EventReceipts[];
    callbacks: Map<string, Array<{
        constraints: Constraints;
        run: (event: any) => void;
    }>>;
    registry: Registry;
    constructor(obj: EthConstructor);
    getContract: ((address: string, abi?: any[]) => Contract) & import("lodash").MemoizedFunction;
    setContract: (contract: Contract) => void;
    sanitizePayload(payload: SubscribePayload): Promise<CommonPayload>;
    getConstraints(payload: SubscribePayload): Promise<Constraints>;
    handleCallbackPush(payloadHash: string, callback: (event: any) => void, constraints: Constraints): boolean;
    constraintCheck(args: EthersEvent, constraints: Constraints): boolean;
    getParams(payload: SubscribePayload): [Promise<CommonPayload>, Promise<Constraints>];
    subscribe(payload: SubscribePayload, callback: (event: any) => void): Promise<boolean>;
    unsubscribe(payload: SubscribePayload): Promise<boolean>;
    subscribedEvents(): Promise<EventReceipts[]>;
}
export * from './utils';
