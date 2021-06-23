/**
 * All Payload implementations **MUST** extend this
 */
export interface SinkPayload {
  /**
   * End-user endpoint. Can be a URL, endpoint etc
   */
  to?: string;
  /**
   * Source address
   */
  from?: string;
  /**
   * Data that goes into the sink
   */
  data?: any;
}

/**
 * All notification channels **MUST** implement the given interface
 */
export interface Sink<SinkPayload, SinkReceipt> {
  /**
   * Name of the sink
   */
  name: string;
  /**
   * Id of the sink
   */
  id: number;
  /**
   * Function that sends the payload into the sink
   */
  send: (payload: SinkPayload) => Promise<boolean>;
  /**
   * Receipts for every payload sent to the sink
   */
  receipts: SinkReceipt[];
  /**
   * Function that returns the sink receipts
   */
  getReceipts: () => Promise<SinkReceipt[]>;
}
