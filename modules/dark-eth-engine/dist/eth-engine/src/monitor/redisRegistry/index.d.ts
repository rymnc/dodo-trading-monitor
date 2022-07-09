import { EventObject, EventTypes, Registry } from "@dodo/trading-monitor";
import { Redis } from "ioredis";
import { RedisRegistryConstructor } from "./types";
export declare class RedisRegistry implements Registry {
    id: number;
    name: string;
    client: Redis;
    constructor(obj: RedisRegistryConstructor);
    set(address: string, key: EventTypes, value: EventObject): Promise<boolean>;
    get(address: string, key: EventTypes): Promise<EventObject>;
}
