import { EventTypes } from "../../sources/types";
import { EventObject, Registry } from "../types";
import { SimpleRegistryConstructor } from "./types";

export class SimpleRegistry implements Registry {
  /**
   * Id of the simple registry
   */
  id: number;
  /**
   * Name of the registry
   */
  name: string = "simpleRegistry";
  /**
   * Mapping of addresses to events
   */
  registry: Map<string, Map<EventTypes, EventObject>>;

  constructor(obj: SimpleRegistryConstructor) {
    this.registry = new Map();
    this.id = obj.id;
  }

  private hasAddress(address: string): boolean {
    const addressEvents = this.registry.has(address);
    if (addressEvents) {
      return true;
    }
    return false;
  }

  private getEvent(address: string, key: EventTypes): EventObject {
    const eventMap = this.getEventMap(address);
    if (eventMap.has(key)) {
      const value = eventMap.get(key);
      if (value) return value;
      throw new Error("[Registry] Invalid k-v set");
    }
    if (typeof key === "undefined")
      throw new Error("[Registry] Invalid k-v set");
    throw new Error("[Registry] Event not found in given address");
  }

  private getEventMap(address: string): Map<EventTypes, EventObject> {
    if (this.hasAddress(address)) {
      const eventMap = this.registry.get(address);
      if (eventMap) return eventMap;
      throw new Error("[Registry] Invalid k-v set");
    } else {
      throw new Error("[Registry] Address not present in registry");
    }
  }

  set(address: string, key: EventTypes, value: EventObject): boolean {
    try {
      if (!key || !value) {
        throw new Error("[Registry] Cannot set null values");
      }
      if (this.hasAddress(address)) {
        const eventMap = this.getEventMap(address);
        eventMap.set(key, value);
        this.registry.set(address, eventMap);
        return true;
      } else {
        const newEventMap = new Map<EventTypes, EventObject>();
        newEventMap.set(key, value);
        this.registry.set(address, newEventMap);
        return true;
      }
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  get(address: string, key: EventTypes): EventObject {
    return this.getEvent(address, key);
  }
}
