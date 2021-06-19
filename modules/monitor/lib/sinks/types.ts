export interface SinkPayload {
  to?: string;
  from?: string;
  data?: any;
}

/**
 * All notification channels must implement the given interface
 */
export interface Sink<P, T> {
  name: string;
  id: number;
  send: (payload: P) => Promise<boolean>;
  receipts: T[];
  getReceipts: () => Promise<T[]>;
}
