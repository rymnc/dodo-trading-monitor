export declare const eventTypes: string[];
export declare type EventTypes = "largeSell" | "largeBuy" | "attack" | "priceMovement" | "largeSwap" | "arbitrage";
export interface Event<EventPayload> {
    type: EventTypes;
    address: string;
    details: EventPayload;
    label: string;
}
export interface EventReceipts {
    type: EventTypes;
    address: string;
}
export interface Source<SubscribePayload, EventPayload> {
    name: string;
    id: number;
    subscribe: (payload: SubscribePayload, callback: (event: Event<EventPayload>) => void) => Promise<boolean>;
    subscribedEvents: () => Promise<EventReceipts[]>;
    unsubscribe: (payload: SubscribePayload) => Promise<boolean>;
}
