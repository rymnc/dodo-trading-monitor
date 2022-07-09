const { create } = require('libp2p');

const GossipSub = require('libp2p-gossipsub');
const Mplex = require('libp2p-mplex')
const TCP = require('libp2p-tcp')
const NOISE = require('libp2p-noise')

export const createNode = async () => {
  try {
    const node = await create({
      modules: {
        connEncryption: [NOISE],
        transport: [TCP],
        streamMuxer: [Mplex],
        pubsub: GossipSub,
      },
      config: {
        pubsub: {
          enable: true,
          emitSelf: false,
        }
      }
    })

    await node.start();

    return node;
  } catch (e) {
    console.error(e)
  }

}