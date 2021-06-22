import { Sink } from "@dodo/trading-monitor";
import { MqPayload, MqSinkConstructor, MqReceipts } from "./types";
import { createNodeRedisClient, WrappedNodeRedisClient } from "handy-redis";

/**
 * Redis Mq Sink
 */
export class MqSink implements Sink<MqPayload, MqReceipts> {
  id: number;
  name: string = "redisMq";
  receipts: MqReceipts[];
  client: WrappedNodeRedisClient;

  /**
   * Constructor
   * @param obj MqSinkConstructor
   */
  constructor(obj: MqSinkConstructor) {
    this.client = createNodeRedisClient({
      host: obj.host,
      port: obj.port,
    });
    this.id = obj.id;
    this.receipts = [];
  }

  /**
   * Get the receipts from redis
   * @returns MqReceipts[]
   */
  async getReceipts(): Promise<MqReceipts[]> {
    try {
      const receipts = await this.client.lrange("receipts", 0, -1);
      return receipts.map((v) => JSON.parse(v));
    } catch (e) {
      throw new Error("[MQSink] Could not get receipts");
    }
  }

  /**
   * Sends the payload
   * @param payload MqPayload
   * @returns Boolean
   */
  async send(payload: MqPayload): Promise<boolean> {
    try {
      const serialized = JSON.stringify(payload);
      await this.client.publish(payload.uuid, serialized);
      await this.client.rpush("receipts", serialized);
      return true;
    } catch (e) {
      return false;
    }
  }
}
