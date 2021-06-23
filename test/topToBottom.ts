import { AddressZero } from "@ethersproject/constants";
const ws = require("ws");
const cleanPayload: any = {
  type: "subscribe",
  channel: {
    eventField: "value",
    eventName: "Transfer",
    label: "Foo Bar",
    triggerValue: 200,
    type: "arbitrage",
  },
};
const {
  scaffoldContracts,
} = require("../modules/monitor/test/scaffoldContracts.ts");

async function main() {
  const wsConnection = new ws("ws://localhost:3000/socket");
  wsConnection.on("open", async () => {
    wsConnection.on("message", async (msg: any) => {
      console.log(msg ?? "");
    });
    const { contract, abi } = await scaffoldContracts();
    cleanPayload.channel.abi = abi;
    cleanPayload.channel.address = contract.address;
    wsConnection.send(JSON.stringify(cleanPayload));
    const tx = await contract.transfer(AddressZero, 2000);
    await tx.wait();
  });
}

main()
  .catch(console.error)
  .then(() => {});
