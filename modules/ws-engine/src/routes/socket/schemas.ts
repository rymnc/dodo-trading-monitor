import { payloadValidator, SubscribePayload } from "@dodo/trading-monitor";

/**
 * Receive types for the websocket message
 */
const receiveTypes = ["subscribe", "unsubscribe", "ping", "pong"];
export type ReceiveType = "subscribe" | "unsubscribe" | "ping" | "pong";

export type SendType = "update" | "error";

type Seconds = number;
export const now = (): Seconds => Math.floor(Date.now() / 1000);

const isNumber = (x: any): x is number => {
  return typeof x === "number";
};

/**
 * Websocket message
 */
export interface ReceiveMessage {
  /**
   * One of ReceiveType
   */
  type: ReceiveType;
  /**
   * Channel must be the subscription payload
   */
  channel?: SubscribePayload;
  /**
   * Non-stale timestamp
   */
  timestamp?: Seconds;
}

/**
 * Validates the websocket message's schema
 * Returns a string in event of an error, which is forwarded to the
 * subscriber
 * @param msg any
 * @returns boolean | string
 */
export const isValid = (msg: any): string | boolean => {
  if (!("type" in msg)) {
    return "type is required";
  } else if (["subscribe", "unsubscribe"].includes(msg.type)) {
    if (!("channel" in msg)) {
      return "channel is required";
    } else {
      if (!payloadValidator(msg.channel)) {
        return `channel is invalid`;
      }
      return true;
    }
  } else {
    if (["ping", "pong"].includes(msg.type)) {
      if (!("timestamp" in msg)) {
        return "timestamp is required";
      }
      if (!isNumber(msg.timestamp)) {
        return "timestamp must be a number";
      }
      if (msg.timestamp + 15 < now()) {
        return "timestamp is too stale";
      }
      return true;
    } else {
      return `type must be one of: ${receiveTypes.join(",")}`;
    }
  }
};

/**
 * Websocket Send message schema
 */
export interface SendMessage {
  /**
   * "update" or "error"
   */
  type: SendType;
  /**
   * Timestamp
   */
  timestamp: Seconds;
  /**
   * Hash of the payload that was used to subscribe to the stream
   */
  channel?: string;
  /**
   * Data that the event emitted
   */
  data?: any;
  /**
   * Error, if any
   */
  error?: string;
}
