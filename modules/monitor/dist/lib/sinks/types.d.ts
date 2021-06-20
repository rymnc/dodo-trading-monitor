export interface SinkPayload {
    to?: string;
    from?: string;
    data?: any;
}
export interface Sink<P, T> {
    name: string;
    id: number;
    send: (payload: P) => Promise<boolean>;
    receipts: T[];
    getReceipts: () => Promise<T[]>;
}
//# sourceMappingURL=types.d.ts.map