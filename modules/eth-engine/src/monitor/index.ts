import { hostname } from "os";
import {
  EthSource,
  Event,
  Middleware,
  SubscribePayload,
} from "@dodo/trading-monitor";
import { MqSink } from "./mqSink";
import { MqPayload } from "./mqSink/types";
import { EthMqConstructor } from "./types";
import hash from "object-hash";

const now = (): number => Math.floor(Date.now() / 1000);

/**
 * Eth Mq Class
 */
export class EthMq
  implements Middleware<SubscribePayload, any, MqPayload, MqPayload>
{
  /**
   * Eth Source
   */
  source: EthSource;
  /**
   * Mq Sink
   */
  sink: MqSink;

  /**
   * Constructor
   * @param obj EthMqConstructor
   */
  constructor(obj: EthMqConstructor) {
    this.source = obj.source;
    this.sink = obj.sink;
  }

  /**
   * Transforms the source event to sink payload
   * @param event Event<any>
   * @returns MqPayload
   */
  async transform(event: Event<any>): Promise<MqPayload> {
    const keys = Object.keys(event.details).filter((v) =>
      Number.isNaN(Number(v))
    );

    const sanitizedDetails: any = {};
    keys.forEach((k) => (sanitizedDetails[k] = event.details[k]));

    return {
      address: event.address,
      from: hostname(),
      data: sanitizedDetails,
      timestamp: now(),
      type: event.type,
      // uuid set later
      uuid: "",
    };
  }

  /**
   * Main runner function
   * @param payload SubscribePayload
   */
  run(payload: SubscribePayload) {
    const boundTransform = this.transform.bind(this);
    this.source.subscribe(payload, async (event) => {
      const slug: Event<any> = {
        address: payload.address,
        type: payload.type,
        label: payload.label,
        details: event,
      };
      const mqPayload = await boundTransform(slug);
      mqPayload.uuid = hash(payload);
      await this.sink.send(mqPayload);
    });
  }
}
