import { EventTypes } from "../../sources/types";
import { EventObject, Registry } from "../types";
export declare class SimpleRegistry implements Registry {
    registry: Map<string, Map<EventTypes, EventObject>>;
    constructor();
    private hasAddress;
    private getEvent;
    private getEventMap;
    set(address: string, key: EventTypes, value: EventObject): boolean;
    get(address: string, key: EventTypes): EventObject;
}
