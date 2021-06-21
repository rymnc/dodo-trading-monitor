import { Source, EventReceipts } from "../types";
import {
  EthConstructor,
  Providers,
  SubscribePayload,
  EthersEvent,
} from "./types";
import { Contract } from "ethers";

/**
 * Eth Source Class
 */
export class EthSource implements Source<SubscribePayload, any> {
  provider: Providers;
  id: number;
  name: string = "ethereum";
  events: EventReceipts[];

  /**
   * Constructor
   * @param obj EthConstructor
   */
  constructor(obj: EthConstructor) {
    this.provider = obj.provider;
    this.id = obj.id;
    this.events = [];
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
    // TODO: create static mapping of event types to related erc20 events
    // and pass it in as the event below
    contract.on(eventName, async (...event) => {
      const args = event[event.length - 1].args;
      if (handler(args)) {
        await callback(
          contract.interface.parseLog(event[event.length - 1]).args
        );
      }
    });
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
