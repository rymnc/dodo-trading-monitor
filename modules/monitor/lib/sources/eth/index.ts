import { Source, EventReceipts } from "../types";
import {
  EthConstructor,
  Providers,
  SubscribePayload,
  EthersEvent,
  CommonPayload,
  Constraints,
} from "./types";
import { Contract } from "ethers";
import hash from "object-hash";

const sanitizePayload = (payload: SubscribePayload): CommonPayload => {
  return {
    abi: payload.abi,
    address: payload.address,
    eventName: payload.eventName,
  };
};

const getConstraints = (payload: SubscribePayload): Constraints => {
  return {
    eventField: payload.eventField,
    triggerValue: payload.triggerValue,
    type: payload.type,
  };
};
/**
 * Eth Source Class
 */
export class EthSource implements Source<SubscribePayload, any> {
  provider: Providers;
  id: number;
  name: string = "ethereum";
  events: EventReceipts[];
  // Hashmap of callbacks
  callbacks: Map<
    string,
    Array<{ constraints: Constraints; run: (event: any) => void }>
  >;

  /**
   * Constructor
   * @param obj EthConstructor
   */
  constructor(obj: EthConstructor) {
    this.provider = obj.provider;
    this.id = obj.id;
    this.events = [];
    this.callbacks = new Map();
  }

  handleCallbackPush(
    payloadHash: string,
    callback: (event: any) => void,
    constraints: Constraints
  ): boolean {
    const callbacks = this.callbacks.get(payloadHash);
    if (typeof callbacks === "undefined") {
      this.callbacks.set(payloadHash, [{ run: callback, constraints }]);
      return true;
    } else {
      this.callbacks.set(payloadHash, [
        ...callbacks,
        { run: callback, constraints },
      ]);
      return false;
    }
  }

  constraintCheck(args: EthersEvent, constraints: Constraints): boolean {
    if (args[constraints.eventField] > constraints.triggerValue) {
      return true;
    }
    return false;
  }

  /**
   * Subscribes to the event, with constraints
   * @param payload SubscribePayload
   * @param callback Function
   * @returns Boolean
   */
  async subscribe(
    payload: SubscribePayload,
    callback: (event: any) => void
  ): Promise<boolean> {
    const payloadHash = hash(sanitizePayload(payload));
    const constraints = getConstraints(payload);
    const isNew = this.handleCallbackPush(payloadHash, callback, constraints);
    const { address, abi, eventName, type } = payload;
    const contract = new Contract(address, abi, this.provider);

    if (isNew) {
      contract.on(eventName, async (...event) => {
        const args = event[event.length - 1].args;
        const callbackArray = this.callbacks.get(payloadHash);
        if (callbackArray) {
          for (const callback of callbackArray) {
            if (this.constraintCheck(args, callback.constraints)) {
              await callback.run(
                contract.interface.parseLog(event[event.length - 1]).args
              );
            }
          }
        }
      });
    }
    this.events.push({ address, type });
    return true;
  }

  /**
   * Returns the events subscribed to
   * @returns EventReceipts[]
   */
  async subscribedEvents(): Promise<EventReceipts[]> {
    return this.events;
  }
}
