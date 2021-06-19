"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthSource = void 0;
const ethers_1 = require("ethers");
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
        this.provider = obj.provider;
        this.id = obj.id;
        this.events = [];
    }
    async subscribe(payload, callback) {
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
        contract.on(eventName, (...event) => {
            const args = event[event.length - 1].args;
            if (handler(args)) {
                callback(contract.interface.parseLog(event[event.length - 1]).args);
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