export type EventTypes =
  | "largeSell"
  | "largeBuy"
  | "attack"
  | "priceMovement"
  | "largeSwap"
  | "arbitrage";

/**
 * All Events must implement this interface
 */
export interface Event<T> {
  type: EventTypes;
  address: string;
  details: T;
  label: string;
}

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
}
