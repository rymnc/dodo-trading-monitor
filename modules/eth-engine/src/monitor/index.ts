import { hostname } from "os";
import { v4 } from "uuid";
import {
  EthSource,
  Event,
  Middleware,
  SubscribePayload,
} from "@dodo/trading-monitor";
import { MqSink } from "./mqSink";
import { MqPayload } from "./mqSink/types";
import { EthMqConstructor } from "./types";

const now = (): number => Math.floor(Date.now() / 1000);

export class EthMq
  implements Middleware<SubscribePayload, any, MqPayload, MqPayload>
{
  source: EthSource;
  sink: MqSink;

  constructor(obj: EthMqConstructor) {
    this.source = obj.source;
    this.sink = obj.sink;
  }

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
      uuid: v4(),
    };
  }

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
      await this.sink.send(mqPayload);
    });
  }
}
