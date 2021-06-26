import { EventObject, EventTypes, Registry } from "@dodo/trading-monitor";
import { Redis } from "ioredis";
import { getRedis } from "../redis";
import { RedisRegistryConstructor } from "./types";

export class RedisRegistry implements Registry {
  /**
   * Id of the redis registry
   */
  id: number;
  /**
   * Name of the registry
   */
  name: string = "redisRegistry";
  /**
   * Redis Client
   */
  client: Redis;

  constructor(obj: RedisRegistryConstructor) {
    this.id = obj.id;
    this.client = getRedis();
  }

  /**
   * Sets the event map in a hashmap with the address as key
   * @param address string
   * @param key EventTypes
   * @param value EventObject
   * @returns boolean
   */
  async set(
    address: string,
    key: EventTypes,
    value: EventObject
  ): Promise<boolean> {
    try {
      await this.client.hset(address, key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Gets the event map from hashmap with the address as key
   * @param address string
   * @param key EventTypes
   * @returns EventObject
   */
  async get(address: string, key: EventTypes): Promise<EventObject> {
    try {
      const length = await this.client.hlen(address);
      if (length > 0) {
        const rawObj = await this.client.hget(address, key);
        if (rawObj === null)
          throw new Error("[Registry] Event not found in given address");
        return JSON.parse(rawObj);
      }
      throw new Error("[Registry] Address not found in registry");
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}
