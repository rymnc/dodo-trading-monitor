import { EventTypes } from "../sources/types";
export interface EventObject {
    eventName: string;
    eventField: string;
}
export interface Registry {
    set: (address: string, key: EventTypes, value: EventObject) => Promise<boolean> | boolean;
    get: (address: string, key: EventTypes) => Promise<EventObject> | EventObject;
    registry: Map<string, Map<EventTypes, EventObject>>;
}
