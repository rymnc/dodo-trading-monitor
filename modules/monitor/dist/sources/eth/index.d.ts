/// <reference types="lodash" />
import { Source, EventReceipts } from "../types";
import { EthConstructor, Providers, SubscribePayload, EthersEvent, Constraints } from "./types";
import { Contract } from "ethers";
export declare class EthSource implements Source<SubscribePayload, any> {
    provider: Providers;
    id: number;
    name: string;
    events: EventReceipts[];
    callbacks: Map<string, Array<{
        constraints: Constraints;
        run: (event: any) => void;
    }>>;
    constructor(obj: EthConstructor);
    getContract: ((address: string, abi?: any[] | undefined) => Contract) & import("lodash").MemoizedFunction;
    setContract: (contract: Contract) => void;
    handleCallbackPush(payloadHash: string, callback: (event: any) => void, constraints: Constraints): boolean;
    constraintCheck(args: EthersEvent, constraints: Constraints): boolean;
    subscribe(payload: SubscribePayload, callback: (event: any) => void): Promise<boolean>;
    unsubscribe(payload: SubscribePayload): Promise<boolean>;
    subscribedEvents(): Promise<EventReceipts[]>;
}
