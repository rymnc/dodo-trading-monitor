import {Sink} from '@dodo/trading-monitor';
import {
  Libp2pPayload,
  Libp2pReceipts,
  Libp2pSinkConstructor,
  Libp2pSinkId
} from './types'
// @ts-expect-error TODO: declaration file 
import {createNode} from './createNode'

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'


export class Libp2pSink<Data> implements Sink<Libp2pPayload<Data>, Libp2pReceipts<Data>> {
  declare id: Libp2pSinkId
  declare name: string;

  declare receipts: Libp2pReceipts<Data>[]

  declare node: Awaited<ReturnType<typeof createNode>>
  
  constructor(obj: Libp2pSinkConstructor) {
    this.id = obj.id

    this.name = 'libp2pSink'
  }

  async init() {
    this.node = await createNode()
  }



  async send<Data>(payload: Libp2pPayload<Data>) {
    try {
      const jsonSerialized = JSON.stringify(payload);
      const uint8Serialized = uint8ArrayFromString(jsonSerialized);
      await this.node.pubsub.publish(payload.uuid, uint8Serialized)
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  }

  async getReceipts() {
    return this.receipts;
  };
}