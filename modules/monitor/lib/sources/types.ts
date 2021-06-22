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
export interface Event<T> {
  type: EventTypes;
  address: string;
  details: T;
  label: string;
}

/**
 * All Event receipts **MUST** implement this interface
 */
export interface EventReceipts {
  type: EventTypes;
  address: string;
}

export interface Source<T, P> {
  name: string;
  id: number;
  subscribe: (
    payload: T,
    callback: (event: Event<P>) => void
  ) => Promise<boolean>;
  subscribedEvents: () => Promise<EventReceipts[]>;
  unsubscribe: (payload: T) => Promise<boolean>;
}
