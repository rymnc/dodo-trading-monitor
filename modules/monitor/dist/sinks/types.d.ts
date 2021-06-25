export interface SinkPayload {
    to?: string;
    from?: string;
    data?: any;
}
export interface Sink<SinkPayload, SinkReceipt> {
    name: string;
    id: number;
    send: (payload: SinkPayload) => Promise<boolean>;
    receipts: SinkReceipt[];
    getReceipts: () => Promise<SinkReceipt[]>;
}
