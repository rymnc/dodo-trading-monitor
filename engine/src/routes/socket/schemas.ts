import marketsJson from "../../markets.json";

export const markets = new Map<string, RawMarketType>(
  marketsJson.map((i: MarketType) => [
    i.id,
    { address: i.address, tokenStandard: i.tokenStandard },
  ])
);

const receiveTypes = ["subscribe", "unsubscribe", "ping", "pong"];
export type ReceiveType = "subscribe" | "unsubscribe" | "ping" | "pong";

export type SendType = "update" | "error";

const channelTypes = ["trades", "orders"];
export type ChannelTypes = "trades" | "orders";

interface RawMarketType {
  address: string;
  tokenStandard: string;
}
interface MarketType extends RawMarketType {
  id: string;
}
export type MarketTypes = MarketType[];

type Seconds = number;
export const now = (): Seconds => Math.floor(Date.now() / 1000);

const isNumber = (x: any): x is number => {
  return typeof x === "number";
};

export interface ReceiveMessage {
  type: ReceiveType;
  channel?: ChannelTypes;
  market?: string;
  timestamp?: Seconds;
}

export const isValid = (msg: any): string | boolean => {
  if (!("type" in msg)) {
    return "type is required";
  } else if (["subscribe", "unsubscribe"].includes(msg.type)) {
    if (!("channel" in msg) || !("market" in msg)) {
      return "channel/market is required";
    } else {
      if (!channelTypes.includes(msg.channel)) {
        return `channel must be one of: ${channelTypes.join(",")}`;
      }
      if (!markets.has(msg.market)) {
        return `market must be one of ${Array.from(markets.keys()).join(",")}`;
      }
      return true;
    }
  } else {
    if (["ping", "pong"].includes(msg.type)) {
      if (!("timestamp" in msg)) {
        return "timestamp is required";
      }
      if (!isNumber(msg.timestamp)) {
        return "timestamp must be a number";
      }
      if (msg.timestamp + 15 < now()) {
        return "timestamp is too stale";
      }
      return true;
    } else {
      return `type must be one of: ${receiveTypes.join(",")}`;
    }
  }
};

export interface SendMessage {
  type: SendType;
  timestamp: Seconds;
  channel?: ChannelTypes;
  market?: MarketTypes;
  data?: any;
  error?: string;
}
