import { EthSource, Event, Middleware, SubscribePayload } from '@dodo/trading-monitor';
import { Libp2pSink } from './libp2pSink';
import { Libp2pPayload, Libp2pReceipts } from './libp2pSink/types';
import { EthLibp2pConstructor } from './types';
export declare class EthLibp2p<Libp2pData> implements Middleware<SubscribePayload, any, Libp2pPayload<Libp2pData>, Libp2pReceipts<Libp2pData>> {
    source: EthSource;
    sink: Libp2pSink<Libp2pData>;
    constructor(obj: EthLibp2pConstructor<Libp2pData>);
    transform(event: Event<any>): Promise<{
        address: string;
        from: any;
        data: any;
        timestamp: number;
        type: import("@dodo/trading-monitor").EventTypes;
        uuid: string;
    }>;
    run(payload: SubscribePayload): Promise<void>;
}
