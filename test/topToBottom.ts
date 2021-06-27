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
import readline from "readline";

async function main() {
  const redis = getRedis();
  const wsConnection = new ws("ws://localhost:5001/socket");
  wsConnection.on("open", async () => {
    let c: number = 0;
    wsConnection.on("message", async (msg: any) => {
      console.log(msg ?? "");
      if (JSON.parse(msg)?.data?.value?.hex === "0x07d0") {
        c++;
        if (c === 10) {
          console.log("e2e test completed");
          redis.disconnect();
          wsConnection.close();
          process.exit(0);
        }
      }
    });
    const { contract, abi } = await scaffoldContracts();
    console.log("Contract deployed to:", contract.address);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    await redis.hset(
      contract.address,
      "arbitrage",
      JSON.stringify({ eventField: "value", eventName: "Transfer" })
    );
    rl.question("Proceed with mining transactions? [y/n] ", async (input) => {
      if (input === "y") {
        cleanPayload.channel.abi = abi;
        cleanPayload.channel.address = contract.address;
        wsConnection.send(JSON.stringify(cleanPayload));
        for (let i = 0; i < 10; i++) {
          const tx = await contract.transfer(AddressZero, 2000);
          await tx.wait();
        }
        rl.close();
      } else if (input === "n") {
        console.log("Cancelling test.");
        process.exit(0);
      } else {
        console.log("Invalid input received! Exiting");
        process.exit(1);
      }
    });
  });

  wsConnection.on("close", () => {
    console.log("socket closed");
  });
}

main()
  .catch(console.error)
  .then(() => {});
