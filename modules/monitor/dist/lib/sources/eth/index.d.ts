import { Source, EventReceipts } from "../types";
import { EthConstructor, Providers, SubscribePayload } from "./types";
export declare class EthSource implements Source<SubscribePayload, any> {
    provider: Providers;
    id: number;
    name: string;
    events: EventReceipts[];
    callbacks: Map<string, Array<(event: any) => void>>;
    constructor(obj: EthConstructor);
    handleCallbackPush(payloadHash: string, callback: (event: any) => void): void;
    subscribe(payload: SubscribePayload, callback: (event: any) => void): Promise<boolean>;
    subscribedEvents(): Promise<EventReceipts[]>;
}
//# sourceMappingURL=index.d.ts.map