"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleRegistry = void 0;
class SimpleRegistry {
    constructor(obj) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "simpleRegistry"
        });
        Object.defineProperty(this, "registry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.registry = new Map();
        this.id = obj.id;
    }
    hasAddress(address) {
        const addressEvents = this.registry.has(address);
        if (addressEvents) {
            return true;
        }
        return false;
    }
    getEvent(address, key) {
        const eventMap = this.getEventMap(address);
        if (eventMap.has(key)) {
            const value = eventMap.get(key);
            if (value)
                return value;
            throw new Error("[Registry] Invalid k-v set");
        }
        if (typeof key === "undefined")
            throw new Error("[Registry] Invalid k-v set");
        throw new Error("[Registry] Event not found in given address");
    }
    getEventMap(address) {
        if (this.hasAddress(address)) {
            const eventMap = this.registry.get(address);
            if (eventMap)
                return eventMap;
            throw new Error("[Registry] Invalid k-v set");
        }
        else {
            throw new Error("[Registry] Address not present in registry");
        }
    }
    set(address, key, value) {
        try {
            if (!key || !value) {
                throw new Error("[Registry] Cannot set null values");
            }
            if (this.hasAddress(address)) {
                const eventMap = this.getEventMap(address);
                eventMap.set(key, value);
                this.registry.set(address, eventMap);
                return true;
            }
            else {
                const newEventMap = new Map();
                newEventMap.set(key, value);
                this.registry.set(address, newEventMap);
                return true;
            }
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    get(address, key) {
        return this.getEvent(address, key);
    }
}
exports.SimpleRegistry = SimpleRegistry;
