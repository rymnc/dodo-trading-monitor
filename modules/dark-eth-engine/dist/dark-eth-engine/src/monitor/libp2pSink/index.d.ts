import { Sink } from '@dodo/trading-monitor';
import { Libp2pPayload, Libp2pReceipts, Libp2pSinkConstructor, Libp2pSinkId } from './types';
import { createNode } from './createNode';
export declare class Libp2pSink<Data> implements Sink<Libp2pPayload<Data>, Libp2pReceipts<Data>> {
    id: Libp2pSinkId;
    name: string;
    receipts: Libp2pReceipts<Data>[];
    node: Awaited<ReturnType<typeof createNode>>;
    constructor(obj: Libp2pSinkConstructor);
    init(): Promise<void>;
    send<Data>(payload: Libp2pPayload<Data>): Promise<boolean>;
    getReceipts(): Promise<Libp2pReceipts<Data>[]>;
}
