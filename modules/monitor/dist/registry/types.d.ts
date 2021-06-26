import { EventTypes } from "../sources/types";
export interface EventObject {
    eventName: string;
    eventField: string;
}
export interface Registry {
    id: number;
    name: string;
    set: (address: string, key: EventTypes, value: EventObject) => Promise<boolean> | boolean;
    get: (address: string, key: EventTypes) => Promise<EventObject> | EventObject;
}
