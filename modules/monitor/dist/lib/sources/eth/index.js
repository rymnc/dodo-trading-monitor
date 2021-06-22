"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthSource = void 0;
const ethers_1 = require("ethers");
const object_hash_1 = __importDefault(require("object-hash"));
const lodash_1 = require("lodash");
const sanitizePayload = (payload) => {
    return {
        abi: payload.abi,
        address: payload.address,
        eventName: payload.eventName,
    };
};
const getConstraints = (payload) => {
    return {
        eventField: payload.eventField,
        triggerValue: payload.triggerValue,
        type: payload.type,
    };
};
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
        this.getContract = lodash_1.memoize(this.getContract);
    }
    getContract(address, abi) {
        return new ethers_1.Contract(address, abi || [], this.provider);
    }
    handleCallbackPush(payloadHash, callback, constraints) {
        const callbacks = this.callbacks.get(payloadHash);
        if (typeof callbacks === "undefined") {
            this.callbacks.set(payloadHash, [{ run: callback, constraints }]);
            return true;
        }
        else {
            this.callbacks.set(payloadHash, [
                ...callbacks,
                { run: callback, constraints },
            ]);
            return false;
        }
    }
    constraintCheck(args, constraints) {
        if (args[constraints.eventField] > constraints.triggerValue) {
            return true;
        }
        return false;
    }
    async subscribe(payload, callback) {
        const payloadHash = object_hash_1.default(sanitizePayload(payload));
        const constraints = getConstraints(payload);
        const isNew = this.handleCallbackPush(payloadHash, callback, constraints);
        const { address, abi, eventName, type } = payload;
        if (isNew) {
            const contract = this.getContract(address, abi);
            contract.on(eventName, async (...event) => {
                const args = event[event.length - 1].args;
                const callbackArray = this.callbacks.get(payloadHash);
                if (callbackArray) {
                    for (const callback of callbackArray) {
                        if (this.constraintCheck(args, callback.constraints)) {
                            await callback.run(contract.interface.parseLog(event[event.length - 1]).args);
                        }
                    }
                }
            });
        }
        this.events.push({ address, type });
        return true;
    }
    async unsubscribe(payload) {
        const payloadHash = object_hash_1.default(sanitizePayload(payload));
        const constraints = getConstraints(payload);
        const callbackArray = this.callbacks.get(payloadHash);
        let popped = false;
        if (callbackArray) {
            const handlerIdx = callbackArray.findIndex((v) => {
                return lodash_1.isEqual(constraints, v.constraints);
            });
            if (handlerIdx !== -1) {
                delete callbackArray[handlerIdx];
                const newCbArray = callbackArray.filter((v) => v !== undefined);
                this.callbacks.set(payloadHash, [...newCbArray]);
                popped = true;
            }
            else {
                throw new Error("[EthSource] Cannot unsubscribe to unknown subscription");
            }
        }
        else {
            throw new Error("[EthSource] Cannot unsubscribe to unknown event");
        }
        if (popped) {
            const contract = this.getContract(payload.address);
            const listeners = contract.listeners(payload.eventName);
            contract.off(payload.eventName, listeners[0]);
            return true;
        }
        else {
            throw new Error("[EthSource] callback was not popped");
        }
    }
    async subscribedEvents() {
        return this.events;
    }
}
exports.EthSource = EthSource;
//# sourceMappingURL=index.js.map