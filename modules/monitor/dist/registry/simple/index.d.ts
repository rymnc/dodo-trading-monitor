import { EventTypes } from "../../sources/types";
import { EventObject, Registry } from "../types";
import { SimpleRegistryConstructor } from "./types";
export declare class SimpleRegistry implements Registry {
    id: number;
    name: string;
    registry: Map<string, Map<EventTypes, EventObject>>;
    constructor(obj: SimpleRegistryConstructor);
    private hasAddress;
    private getEvent;
    private getEventMap;
    set(address: string, key: EventTypes, value: EventObject): boolean;
    get(address: string, key: EventTypes): EventObject;
}
