import { providers, Contract, ContractFactory } from "ethers";
import artifact from "./artifact.json";

export const scaffoldContracts = async (): Promise<Contract> => {
  const provider = new providers.WebSocketProvider("ws://localhost:8545");
  const signer = provider.getSigner(0);
  const cFactory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
  const contract = await cFactory.deploy(100000000000, "Token", "USD", 6);
  await contract.issue(1000000);
  return contract;
};
