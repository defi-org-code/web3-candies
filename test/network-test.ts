import { expect } from "chai";
import { account, block, bn, estimatedBlockNumber, web3, zero, setWeb3Instance } from "../src";
import { artifact, resetNetworkFork, useChaiBN } from "../src/hardhat";
import Web3 from "web3";

useChaiBN();

describe("network", () => {
  it("hardhat + web3", async () => {
    expect(require("hardhat").web3.utils.keccak256("foo")).eq(web3().utils.keccak256("foo"));

    await resetNetworkFork();

    expect(await account()).eq(await account(0));

    const startBalance = bn(await web3().eth.getBalance(await account()));
    expect(startBalance).bignumber.gt(zero);

    await web3().eth.sendTransaction({ from: await account(), to: await account(9), value: startBalance.divn(2) });

    await resetNetworkFork();

    expect(await web3().eth.getBalance(await account())).bignumber.eq(startBalance);

    expect(artifact("Example").sourceName).eq("contracts/Example.sol");
  });

  it("web3 global singleton", async () => {
    const prev = web3();
    const instance = new Web3("");
    setWeb3Instance(instance);
    expect(web3()).eq(instance);
    setWeb3Instance(prev);
  });

  it("estimated block number", async () => {
    const now = await block();
    expect(await estimatedBlockNumber(Date.now(), 10)).eq(now.number);
    expect(await estimatedBlockNumber(Date.now() - 10_000, 10)).eq(now.number - 1);
  });
});
