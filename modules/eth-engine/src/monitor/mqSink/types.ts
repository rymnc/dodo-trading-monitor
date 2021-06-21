import { SinkPayload, EventTypes } from "@dodo/trading-monitor";

export interface MqSinkConstructor {
  host: string;
  port: number;
  id: number;
}

export interface MqPayload extends SinkPayload {
  from: string;
  type: EventTypes;
  address: string;
  data: any;
  timestamp: number;
  uuid: string;
}

export interface MqReceipts extends MqPayload {}
