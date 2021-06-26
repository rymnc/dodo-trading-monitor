import {
  WebSocketProvider,
  AlchemyWebSocketProvider,
  InfuraWebSocketProvider,
  FallbackProvider,
} from "@ethersproject/providers";
import { BigNumberish, BigNumber } from "ethers";
import { eventTypes, EventTypes } from "../types";
import { Result } from "@ethersproject/abi";
import { Interface, isAddress, isBytesLike } from "ethers/lib/utils";
import { Registry } from "../../registry/types";

/**
 * Re-exporting EthersEvent
 */
export type EthersEvent = Result;

/**
 * Interface for k-v matching of contracts
 */
export interface CommonPayload {
  /**
   * Ethereum Address
   */
  address: string;
  /**
   * ABI of the contract
   */
  abi: any[];
  /**
   * Event to subscribe to
   */
  eventName: string;
}

/**
 * Interface for constraints applied to events
 */
export interface Constraints {
  /**
   * Type can be any one of EventTypes
   */
  type: EventTypes;
  /**
   * Field that is of value to the emitted event
   */
  eventField: string;
  /**
   * A Value to constraint the event
   */
  triggerValue: BigNumberish;
}

/**
 * Subscription Payload for the Event
 */
export interface SubscribePayload {
  address: string;
  abi: any[];
  type: EventTypes;
  triggerValue: BigNumberish;
  /**
   * Label for the event. Purely sugar
   */
  label: string;
}

/**
 * Below are the functions used to provide runtime validation to
 * subscription payloads. Can be extended as well
 */
const hasAddress = (p: any) => "address" in p && isAddress(p.address);
const hasAbi = (p: any) =>
  "abi" in p && Array.isArray(p.abi) && p.abi.length > 0;
const hasEName = (p: any) => {
  if (
    "eventName" in p &&
    typeof p.eventName === "string" &&
    p.eventName.length > 0
  ) {
    if (hasAbi(p)) {
      try {
        // Checking if the event name is valid from the interface of provided abi
        const iface = new Interface(p.abi);
        iface.getEvent(p.eventName);
        return true;
      } catch (e) {
        return false;
      }
    } else return false;
  } else {
    return false;
  }
};
const hasEType = (p: any) => "type" in p && eventTypes.includes(p.type);
const hasEField = (p: any) =>
  "eventField" in p &&
  typeof p.eventField === "string" &&
  p.eventField.length > 0;
const hasTriggerValue = (p: any) =>
  "triggerValue" in p &&
  (["bigint", "number"].includes(typeof p.triggerValue) ||
    isBytesLike(p.triggerValue) ||
    BigNumber.isBigNumber(p.triggerValue));
const hasLabel = (p: any) =>
  "label" in p && typeof p.label === "string" && p.label.length > 0;

const validators = [
  hasAddress,
  hasAbi,
  hasEName,
  hasEType,
  hasEField,
  hasTriggerValue,
  hasLabel,
];

/**
 * Runtime validation for subscription payloads
 * @param p any
 * @returns boolean
 */
export const payloadValidator = (p: any): boolean => {
  const valid = validators.map((cb) => cb(p));
  if (valid.indexOf(false) !== -1) return false;
  return true;
};

/**
 * For realtime access, only websocket providers must be allowed
 */
export type Providers =
  | WebSocketProvider
  | AlchemyWebSocketProvider
  | InfuraWebSocketProvider
  | FallbackProvider;

/**
 * Constructor interface for the Eth Source
 */
export interface EthConstructor {
  provider: Providers;
  registry: Registry;
  id: number;
}
