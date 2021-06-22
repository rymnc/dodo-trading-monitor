"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthSource = void 0;
const ethers_1 = require("ethers");
const object_hash_1 = __importDefault(require("object-hash"));
class EthSource {
    constructor(obj) {
        Object.defineProperty(this, "provider", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
            value: "ethereum"
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.provider = obj.provider;
        this.id = obj.id;
        this.events = [];
        this.callbacks = new Map();
    }
    handleCallbackPush(payloadHash, callback) {
        const callbacks = this.callbacks.get(payloadHash);
        if (typeof callbacks === "undefined") {
            this.callbacks.set(payloadHash, [callback]);
        }
        else {
            this.callbacks.set(payloadHash, [...callbacks, callback]);
        }
    }
    async subscribe(payload, callback) {
        const payloadHash = object_hash_1.default(payload);
        this.handleCallbackPush(payloadHash, callback);
        const { address, abi, eventName, eventField, type } = payload;
        const contract = new ethers_1.Contract(address, abi, this.provider);
        let handler;
        switch (payload.type) {
            case "largeBuy":
            case "largeSell":
            case "priceMovement":
                handler = (args) => {
                    if (args[eventField] > payload.triggerValue) {
                        return true;
                    }
                    return false;
                };
                break;
            default:
                throw new Error("Invalid event type for EthSource");
        }
        contract.on(eventName, async (...event) => {
            const args = event[event.length - 1].args;
            const callbackArray = this.callbacks.get(payloadHash);
            if (callbackArray) {
                for (const callback of callbackArray) {
                    if (handler(args)) {
                        await callback(contract.interface.parseLog(event[event.length - 1]).args);
                    }
                }
            }
        });
        this.events.push({ address, type });
        return true;
    }
    async subscribedEvents() {
        return this.events;
    }
}
exports.EthSource = EthSource;
//# sourceMappingURL=index.js.map