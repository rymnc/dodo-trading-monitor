import { AddressZero } from "@ethersproject/constants";
const ws = require("ws");
const cleanPayload: any = {
  type: "subscribe",
  channel: {
    label: "Foo Bar",
    triggerValue: 200,
    type: "arbitrage",
  },
};
const {
  scaffoldContracts,
} = require("../modules/monitor/test/scaffoldContracts.ts");
import { getRedis } from "../modules/eth-engine/src/monitor/redis";

async function main() {
  const redis = getRedis();
  const wsConnection = new ws("ws://localhost:5001/socket");
  wsConnection.on("open", async () => {
    wsConnection.on("message", async (msg: any) => {
      console.log(msg ?? "");
      if (JSON.parse(msg)?.data?.value?.hex === "0x07d0") {
        console.log("e2e test completed");
        redis.disconnect();
        wsConnection.close();
        process.exit(0);
      }
    });
    const { contract, abi } = await scaffoldContracts();
    await redis.hset(
      contract.address,
      "arbitrage",
      JSON.stringify({ eventField: "value", eventName: "Transfer" })
    );
    cleanPayload.channel.abi = abi;
    cleanPayload.channel.address = contract.address;
    wsConnection.send(JSON.stringify(cleanPayload));
    const tx = await contract.transfer(AddressZero, 2000);
    await tx.wait();
  });
  wsConnection.on("close", () => {
    console.log("socket closed");
  });
}

main()
  .catch(console.error)
  .then(() => {});
