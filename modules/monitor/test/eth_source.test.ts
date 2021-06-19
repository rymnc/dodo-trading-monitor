import { spawnSync } from "child_process";
import { EthSource } from "@dodo/trading-monitor";
import { WebSocketProvider } from "@ethersproject/providers";
import { expect } from "chai";
import { spy, restore, assert } from "sinon";
import { scaffoldContracts } from "./scaffoldContracts";
import { AddressZero } from "@ethersproject/constants";
import "mocha";

let provider: WebSocketProvider = new WebSocketProvider("ws://localhost:8545");
let es: EthSource;
describe("[eth source]", () => {
  before(async () => {
    spawnSync("npx", ["ganache-cli"]);
  });

  beforeEach(() => {
    es = new EthSource({ id: 0, provider });
  });

  afterEach(() => {
    restore();
  });

  it("Should initialize", () => {
    expect(es).to.be.an.instanceOf(EthSource);
  });

  it("Should return 0 event receipts initially", async () => {
    const events = await es.subscribedEvents();
    expect(events).to.be.empty;
  });

  it("Should subscribe to an event and callback", async () => {
    const { contract, abi } = await scaffoldContracts();
    const callback = spy();
    const status = await es.subscribe(
      {
        address: contract.address,
        type: "largeBuy",
        eventName: "Transfer",
        abi,
        eventField: "value",
        triggerValue: 200,
      },
      callback
    );
    const tx = await contract.transfer(AddressZero, 100000);
    await tx.wait();
    expect(status).to.eql(true);
    assert.calledOnce(callback);
    expect(es.events).to.eql([{ address: contract.address, type: "largeBuy" }]);
  });
});
