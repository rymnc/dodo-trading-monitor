import { SinkPayload, EventTypes } from "@dodo/trading-monitor";

export interface MqSinkConstructor {
  /**
   * Id of the Sink
   */
  id: number;
}

export interface MqPayload extends SinkPayload {
  /**
   * Hostname
   */
  from: string;
  /**
   * One of EventTypes
   */
  type: EventTypes;
  /**
   * Ethereum Address
   */
  address: string;
  /**
   * Event Details
   */
  data: any;
  /**
   * Timestamp
   */
  timestamp: number;
  /**
   * Payload hash, unique identifier for the subscription
   */
  uuid: string;
}

export interface MqReceipts extends MqPayload {}
