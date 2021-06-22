import { Source, EventReceipts } from "../types";
import {
  EthConstructor,
  Providers,
  SubscribePayload,
  EthersEvent,
  CommonPayload,
} from "./types";
import { Contract } from "ethers";
import hash from "object-hash";

/**
 * Eth Source Class
 */
export class EthSource implements Source<SubscribePayload, any> {
  provider: Providers;
  id: number;
  name: string = "ethereum";
  events: EventReceipts[];
  // Hashmap of callbacks
  callbacks: Map<string, Array<(event: any) => void>>;

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
    callback: (event: any) => void
  ): boolean {
    const callbacks = this.callbacks.get(payloadHash);
    if (typeof callbacks === "undefined") {
      this.callbacks.set(payloadHash, [callback]);
      return true;
    } else {
      this.callbacks.set(payloadHash, [...callbacks, callback]);
      return false;
    }
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
    const payloadHash = hash(payload as CommonPayload);
    const isNew = this.handleCallbackPush(payloadHash, callback);
    const { address, abi, eventName, eventField, type } = payload;
    const contract = new Contract(address, abi, this.provider);
    let handler: (...args: any[]) => boolean;
    switch (payload.type) {
      case "largeBuy":
      case "largeSell":
      case "priceMovement":
        handler = (args: EthersEvent) => {
          if (args[eventField] > payload.triggerValue) {
            return true;
          }
          return false;
        };
        break;
      default:
        throw new Error("Invalid event type for EthSource");
    }

    if (isNew) {
      contract.on(eventName, async (...event) => {
        const args = event[event.length - 1].args;
        const callbackArray = this.callbacks.get(payloadHash);
        if (callbackArray) {
          for (const callback of callbackArray) {
            if (handler(args)) {
              await callback(
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
