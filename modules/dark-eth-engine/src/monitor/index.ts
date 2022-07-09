import {
  EthSource,
  Event,
  Middleware,
  SubscribePayload
} from '@dodo/trading-monitor'

import {
  Libp2pSink
} from './libp2pSink'
import {
  Libp2pPayload, Libp2pReceipts,
} from './libp2pSink/types'
import {EthLibp2pConstructor} from './types'

import hash from 'object-hash'

const now = (): number => Math.floor(Date.now() / 1000);

export class EthLibp2p<Libp2pData> implements Middleware<SubscribePayload, any,Libp2pPayload<Libp2pData>, Libp2pReceipts<Libp2pData>> {
  source: EthSource;
  sink: Libp2pSink<Libp2pData>;

  constructor(obj: EthLibp2pConstructor<Libp2pData>) {
    this.source = obj.source;
    this.sink = obj.sink;
  }

  async transform(event: Event<any>) {
    const keys = Object.keys(event.details).filter((v) =>
    Number.isNaN(Number(v))
  );

  const sanitizedDetails: any = {};
  keys.forEach((k) => (sanitizedDetails[k] = event.details[k]));


    return {
      address: event.address,
      from: this.sink.node.peerId.toString(),
      data: sanitizedDetails,
      timestamp: now(),
      type: event.type,
      // uuid set later
      uuid: "",
    }
  }

  async run(payload: SubscribePayload) {
    const boundTransform = this.transform.bind(this);

    try {
      await this.source.subscribe(payload, async (event) => {
        const slug: Event<any> = {
          address: payload.address,
          type: payload.type,
          label: payload.label,
          details: event,
        };
        const libp2pPayload = await boundTransform(slug);
        libp2pPayload.uuid = hash(payload);
        // sign the uuid - so the topic stays private between the publisher and subscriber
        await this.sink.send(libp2pPayload);
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}