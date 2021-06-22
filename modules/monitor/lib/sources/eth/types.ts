import {
  WebSocketProvider,
  AlchemyWebSocketProvider,
  InfuraWebSocketProvider,
  FallbackProvider,
} from "@ethersproject/providers";
import { BigNumberish, BigNumber } from "ethers";
import { eventTypes, EventTypes } from "../types";
import { Result } from "@ethersproject/abi";
import { isAddress, isBytesLike} from "ethers/lib/utils";

export type EthersEvent = Result;

export interface CommonPayload {
  address: string;
  abi: any[];
  eventName: string;
}

export interface Constraints {
  type: EventTypes;
  eventField: string;
  triggerValue: BigNumberish;
}

/**
 * Subscription Payload for the Event
 */
export interface SubscribePayload extends CommonPayload, Constraints {
  label: string;
}

const hasAddress = (p: any) => ("address" in p && isAddress(p.address))
const hasAbi = (p: any) => ("abi" in p && Array.isArray(p.abi))
const hasEName = (p: any) => ("eventName" in p && typeof p.eventName === "string" && p.eventName.length > 0)
const hasEType = (p: any) => ("type" in p && [eventTypes].includes(p.type))
const hasEField = (p: any) => ("eventField" in p && typeof p.eventField === "string" && p.eventField.length > 0)
const hasTriggerValue = (p: any) => ("triggerValue" in p && (["bigint", "string", "number"].includes(typeof p.triggerValue) || isBytesLike(p.triggerValue) || BigNumber.isBigNumber(p.triggerValue)))
const hasLabel = (p: any) => ("label" in p && typeof p.label === "string" && p.label.length > 0)

const validators = [hasAddress, hasAbi, hasEName, hasEType, hasEField, hasTriggerValue, hasLabel]

export const payloadValidator =(p: any): boolean => {
  const valid = validators.map((cb) => cb(p))  
  if(valid.indexOf(false) !== -1) return true
  return false
}

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
  id: number;
}
