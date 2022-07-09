import { SinkPayload, EventTypes } from "@dodo/trading-monitor";
export declare type Libp2pSinkId = number;
export interface Libp2pSinkConstructor {
    id: Libp2pSinkId;
}
export interface Libp2pPayload<Data> extends SinkPayload {
    from: string;
    type: EventTypes;
    address: string;
    data: Data;
    timestamp: number;
    uuid: string;
}
export interface Libp2pReceipts<Data> extends Libp2pPayload<Data> {
    timestamp: number;
}
