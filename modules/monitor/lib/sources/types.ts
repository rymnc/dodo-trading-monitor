import { Registry } from "../registry/types";

export const eventTypes = [
  "largeSell",
  "largeBuy",
  "attack",
  "priceMovement",
  "largeSwap",
  "arbitrage",
];
/**
 * Event Types
 */
export type EventTypes =
  | "largeSell"
  | "largeBuy"
  | "attack"
  | "priceMovement"
  | "largeSwap"
  | "arbitrage";

/**
 * All Events **MUST** implement this interface
 */
export interface Event<EventPayload> {
  /**
   * Type can be any one of EventTypes
   */
  type: EventTypes;
  /**
   * Ethereum Address
   */
  address: string;
  /**
   * The event payload
   */
  details: EventPayload;
  /**
   * Label for the event. Purely sugar
   */
  label: string;
}

/**
 * All Event receipts **MUST** implement this interface
 */
export interface EventReceipts {
  /**
   * Type can be any one of EventTypes
   */
  type: EventTypes;
  /**
   * Ethereum Address
   */
  address: string;
}

export interface Source<SubscribePayload, EventPayload> {
  /**
   * Name of the source
   */
  name: string;
  /**
   * Id of the source
   */
  id: number;
  /**
   * Function that subscribes to the event
   */
  subscribe: (
    payload: SubscribePayload,
    callback: (event: Event<EventPayload>) => void
  ) => Promise<boolean>;
  /**
   * Function that returns the events emitted upon subscription
   */
  subscribedEvents: () => Promise<EventReceipts[]>;
  /**
   * Function that unsubscribes to the event
   */
  unsubscribe: (payload: SubscribePayload) => Promise<boolean>;
  registry: Registry;
}
