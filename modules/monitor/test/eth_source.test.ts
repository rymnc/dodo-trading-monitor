import { EthSource, SubscribePayload } from "@dodo/trading-monitor";
import { WebSocketProvider } from "@ethersproject/providers";
import { expect } from "chai";
import { spy, restore, assert } from "sinon";
import { scaffoldContracts } from "./scaffoldContracts";
import { AddressZero } from "@ethersproject/constants";
import hash from "object-hash";
import "mocha";

let provider: WebSocketProvider = new WebSocketProvider("ws://localhost:8545");
let es: EthSource;

describe("[eth source]", () => {
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

  it("Should subscribe to an event and not callback", async () => {
    const { contract, abi } = await scaffoldContracts();
    const callback = spy();
    const status = await es.subscribe(
      {
        address: contract.address,
        type: "largeSell",
        eventName: "Transfer",
        abi,
        eventField: "value",
        triggerValue: 200,
        label: "Tether Token",
      },
      callback
    );
    const tx = await contract.transfer(AddressZero, 10);
    await tx.wait();
    expect(status).to.eql(true);
    assert.neverCalledWith(callback);
    expect(es.events).to.eql([
      { address: contract.address, type: "largeSell" },
    ]);
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
        label: "Tether Token",
      },
      callback
    );
    const tx = await contract.transfer(AddressZero, 100000);
    await tx.wait();
    expect(status).to.eql(true);
    assert.calledOnce(callback);
    expect(es.events).to.eql([{ address: contract.address, type: "largeBuy" }]);
  });

  it("Should subscribe to an event and callback multiple times", async () => {
    const { contract, abi } = await scaffoldContracts();
    const callback = spy();
    const statuses = Array(2);
    for (let i = 0; i < 2; i++) {
      statuses.push(
        await es.subscribe(
          {
            address: contract.address,
            type: "largeBuy",
            eventName: "Transfer",
            abi,
            eventField: "value",
            triggerValue: 200,
            label: "Tether Token",
          },
          callback
        )
      );
    }
    const tx = await contract.transfer(AddressZero, 100000);
    await tx.wait();
    statuses.forEach((status) => expect(status).to.eql(true));
    expect(callback.callCount).to.eql(2);
    const event = { address: contract.address, type: "largeBuy" };
    expect(es.events).to.eql(Array(2).fill(event));
  });

  it("Should create different handlers for different events", async () => {
    const { contract, abi } = await scaffoldContracts();
    const callback1 = spy();
    const callback2 = spy();
    const callback3 = spy();
    await es.subscribe(
      {
        address: contract.address,
        type: "largeBuy",
        eventName: "Transfer",
        abi,
        eventField: "value",
        triggerValue: 200,
        label: "Tether Token",
      },
      callback1
    );
    await es.subscribe(
      {
        address: contract.address,
        type: "largeSwap",
        eventName: "Transfer",
        abi,
        eventField: "value",
        triggerValue: 1000000,
        label: "Not Tether Token",
      },
      callback2
    );
    await es.subscribe(
      {
        address: contract.address,
        type: "largeBuy",
        eventName: "Transfer",
        abi,
        eventField: "value",
        triggerValue: 300,
        label: "Tether Token",
      },
      callback3
    );
    const tx = await contract.transfer(AddressZero, 100000);
    await tx.wait();

    expect(callback1.callCount).to.eql(1);
    expect(callback2.callCount).to.eql(0);
    expect(callback3.callCount).to.eql(1);

    expect(es.callbacks.size === 1);
    const pHash = hash({
      abi,
      address: contract.address,
      eventName: "Transfer",
    });
    expect(es.callbacks.has(pHash)).to.eql(true);
    const callbacks = es.callbacks.get(pHash);
    expect(callbacks).to.not.be.undefined;
    expect(callbacks?.length).to.eql(3);
  });

  it("Should handle unsubscription", async () => {
    const { contract, abi } = await scaffoldContracts();
    const callback = spy();
    const payload: SubscribePayload = {
      address: contract.address,
      type: "largeBuy",
      eventName: "Transfer",
      abi,
      eventField: "value",
      triggerValue: 200,
      label: "Tether Token",
    };
    await es.subscribe(payload, callback);

    const tx = await contract.transfer(AddressZero, 100000);
    await tx.wait();

    expect(callback.callCount).to.eql(1);

    const status = await es.unsubscribe(payload);

    expect(status).to.eql(true);

    const tx2 = await contract.transfer(AddressZero, 100000);
    await tx2.wait();

    expect(callback.callCount).to.eql(1);
    const esContract = es.getContract(contract.address);
    expect(esContract.listenerCount()).to.eql(0);
  });
});
