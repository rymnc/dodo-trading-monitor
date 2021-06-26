import { SimpleRegistry } from "@dodo/trading-monitor";
import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";
import "mocha";

let registry: SimpleRegistry;
describe("[simple registry]", () => {
  beforeEach(() => {
    registry = new SimpleRegistry({ id: 0 });
  });

  it("Should set event", () => {
    const status = registry.set(AddressZero, "largeBuy", {
      eventName: "Transfer",
      eventField: "value",
    });
    expect(status).to.eql(true);
  });

  it("Should get event", () => {
    registry.set(AddressZero, "largeBuy", {
      eventName: "Transfer",
      eventField: "value",
    });
    const event = registry.get(AddressZero, "largeBuy");
    expect(event).to.eql({
      eventName: "Transfer",
      eventField: "value",
    });
  });

  it("Should throw if address not found", () => {
    expect(() => registry.get(AddressZero, "largeBuy")).to.throw(
      "[Registry] Address not present in registry"
    );
  });

  it("Should throw if event not found", () => {
    registry.set(AddressZero, "largeSell", {
      eventName: "Transfer",
      eventField: "value",
    });
    expect(() => registry.get(AddressZero, "largeBuy")).to.throw(
      "[Registry] Event not found in given address"
    );
  });

  it("Should throw if invalid k-v is set", () => {
    // @ts-ignore
    expect(() => registry.set(AddressZero, undefined)).to.throw(
      "[Registry] Cannot set null values"
    );
  });

  it("Should throw if invalid k-v is tried to get", () => {
    const undefinedMap = new Map();
    undefinedMap.set(undefined, undefined);
    registry.registry.set(AddressZero, undefinedMap);
    // @ts-ignore
    expect(() => registry.get(AddressZero, undefined)).to.throw(
      "[Registry] Invalid k-v set"
    );
  });
});
