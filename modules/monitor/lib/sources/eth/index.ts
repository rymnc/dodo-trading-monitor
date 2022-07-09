import { Source, EventReceipts } from "../types";
import {
  EthConstructor,
  Providers,
  SubscribePayload,
  EthersEvent,
  CommonPayload,
  Constraints,
} from "./types";
import { BigNumber, Contract } from "ethers";
import hash from "object-hash";
import { isEqual, memoize } from "lodash";
import { Registry } from "../../registry/types";

/**
 * Eth Source Class
 */
export class EthSource implements Source<SubscribePayload, any> {
  /**
   * The provider has to be a websocket provider
   */
  provider: Providers;
  /**
   * Id of the Source. Useful if multiple sources and sinks are used
   */
  id: number;
  /**
   * Name of the source
   */
  name: string = "ethereum";
  /**
   * Array of event receipts. The class can be extended
   * if you have other plans for them!
   */
  events: EventReceipts[];
  /**
   *  Hashmap of callbacks
   */
  callbacks: Map<
    string,
    Array<{ constraints: Constraints; run: (event: any) => void }>
  >;
  /**
   * Registry to fetch events from
   */
  registry: Registry;

  /**
   * Constructor
   * @param obj EthConstructor
   */
  constructor(obj: EthConstructor) {
    this.provider = obj.provider;
    this.id = obj.id;
    this.events = [];
    this.callbacks = new Map();
    this.registry = obj.registry;
  }

  /**
   * Memoized version of this function ensures that
   * we use the same contract instance for multiple subscriptions
   *
   * It allows for efficient memory handling
   *
   * @param address string
   * @param abi any[]
   * @returns Contract
   */
  getContract = memoize((address: string, abi?: any[]): Contract => {
    return new Contract(address, abi || [], this.provider);
  });

  /**
   * Sets the contract back to memoized cache
   * @param contract Contract
   */
  setContract = (contract: Contract): void => {
    this.getContract.cache.set(contract.address, contract);
  };

  /**
   * Casts the subscribe payload into the common payload,
   * which allows efficient grouping of callbacks
   * @param payload SubscribePayload
   * @returns CommonPayload
   */
  async sanitizePayload(payload: SubscribePayload): Promise<CommonPayload> {
    try {
      const { eventName } = await this.registry.get(
        payload.address,
        payload.type
      );
      return {
        abi: payload.abi,
        address: payload.address,
        eventName: eventName,
      };
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Returns the constraints for the provided subscription payload
   * @param payload SubscribePayload
   * @returns Constraints
   */
  async getConstraints(payload: SubscribePayload): Promise<Constraints> {
    try {
      const { eventField } = await this.registry.get(
        payload.address,
        payload.type
      );
      return {
        eventField: eventField,
        triggerValue: BigNumber.from(payload.triggerValue),
        type: payload.type,
      };
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Pushes the callback for the specific event into the
   * callback map, which is keyed by the CommonPayload
   *
   * @param payloadHash string
   * @param callback Function
   * @param constraints Constraints
   * @returns boolean
   */
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

  /**
   * Simple check for the event. It should be extended for
   * advanced checks
   * @param args EthersEvent
   * @param constraints Constraints
   * @returns boolean
   */
  constraintCheck(args: EthersEvent, constraints: Constraints): boolean {
    if (
      BigNumber.from(args[constraints.eventField]).gte(constraints.triggerValue)
    ) {
      return true;
    }
    return false;
  }

  getParams(
    payload: SubscribePayload
  ): [Promise<CommonPayload>, Promise<Constraints>] {
    return [this.sanitizePayload(payload), this.getConstraints(payload)];
  }

  /**
   * Intelligently subscribes to the event, with constraints
   * @param payload SubscribePayload
   * @param callback Function
   * @returns Boolean
   */
  async subscribe(
    payload: SubscribePayload,
    callback: (event: any) => void
  ): Promise<boolean> {
    try {
      const [commonPayload, constraints] = await Promise.all(
        this.getParams(payload)
      );
      const payloadHash = hash(commonPayload);
      const isNew = this.handleCallbackPush(payloadHash, callback, constraints);
      const { address, abi, type } = payload;
      const { eventName } = commonPayload;
      if (isNew) {
        const contract = this.getContract(address, abi);
        this.setContract(
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
          })
        );
      }
      this.events.push({ address, type });
      return true;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  /**
   * Handles unsubscription and removal of callbacks
   * @param payload SubscribePayload
   * @returns boolean
   */
  async unsubscribe(payload: SubscribePayload): Promise<boolean> {
    const [commonPayload, constraints] = await Promise.all(
      this.getParams(payload)
    );
    const payloadHash = hash(commonPayload);
    const callbackArray = this.callbacks.get(payloadHash);
    let popped: boolean = false;
    if (callbackArray) {
      const handlerIdx = callbackArray.findIndex((v) => {
        return isEqual(constraints, v.constraints);
      });
      if (handlerIdx !== -1) {
        delete callbackArray[handlerIdx];
        const newCbArray = callbackArray.filter((v) => v !== undefined);
        this.callbacks.set(payloadHash, [...newCbArray]);
        popped = true;
        //return true;
      } else {
        throw new Error(
          "[EthSource] Cannot unsubscribe to unknown subscription"
        );
      }
    } else {
      throw new Error("[EthSource] Cannot unsubscribe to unknown event");
    }
    if (popped) {
      const contract = this.getContract(payload.address);
      const listeners = contract.listeners(commonPayload.eventName);
      this.setContract(contract.off(commonPayload.eventName, listeners[0]));
      return true;
    } else {
      throw new Error("[EthSource] callback was not popped");
    }
  }

  /**
   * Returns the events subscribed to
   * @returns EventReceipts[]
   */
  async subscribedEvents(): Promise<EventReceipts[]> {
    return this.events;
  }
}


export * from './utils'