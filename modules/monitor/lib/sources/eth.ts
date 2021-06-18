import { EventTypes, Source, EventReceipts } from "./types";
import {
  WebSocketProvider,
  AlchemyWebSocketProvider,
  InfuraWebSocketProvider,
  FallbackProvider,
} from "@ethersproject/providers";
import { Contract } from "ethers";

interface SubscribePayload {
  contract: Contract;
  type: EventTypes;
  eventName: string;
  eventValue: string;
}

type Providers =
  | WebSocketProvider
  | AlchemyWebSocketProvider
  | InfuraWebSocketProvider
  | FallbackProvider;

interface EthConstructor {
  provider: Providers;
  id: number;
}

export class EthSource implements Source<SubscribePayload, any> {
  provider: Providers;
  id: number;
  name: string = "ethereum";
  events: EventReceipts[];

  constructor(obj: EthConstructor) {
    this.provider = obj.provider;
    this.id = obj.id;
    this.events = [];
  }

  async subscribe(
    payload: SubscribePayload,
    callback: (event: any) => void
  ): Promise<boolean> {
    switch (payload.type) {
      case "largeBuy":
        // TODO set handler
        break;
      case "largeSell":
        // TODO set handler
        break;
      case "priceMovement":
        // TODO set handler
        break;
      default:
        throw new Error("Invalid event type for EthSource");
    }
    // TODO: create static mapping of event types to related erc20 events
    // and pass it in as the event below
    payload.contract.on(payload.eventName, (...event) => {
      // TODO: middleware to handle based on the event type above
      callback(
        payload.contract.interface.parseLog(event[event.length - 1]).args
      );
    });
    this.events.push({ address: payload.contract.address, type: payload.type });
    return true;
  }

  async subscribedEvents(): Promise<EventReceipts[]> {
    return this.events;
  }
}
