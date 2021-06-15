import { expect } from "chai";
import {
  account,
  artifact,
  block,
  bn,
  estimatedBlockNumber,
  mineBlock,
  mineBlocks,
  resetNetworkFork,
  web3,
  useChaiBN,
  zero,
} from "../src";

useChaiBN();

describe("network", () => {
  it("hardhat + web3", async () => {
    expect(require("hardhat").web3.utils.keccak256("foo")).eq(web3().utils.keccak256("foo"));

    expect(await account()).eq(await account(0));

    const startBalance = bn(await web3().eth.getBalance(await account()));
    expect(startBalance).bignumber.gt(zero);

    await web3().eth.sendTransaction({ from: await account(), to: await account(9), value: startBalance.divn(2) });
    await resetNetworkFork();

    expect(await web3().eth.getBalance(await account())).bignumber.eq(startBalance);

    expect(artifact("Example").sourceName).eq("contracts/Example.sol");
  });

  it("mine blocks", async () => {
    const startBlock = await block("latest");

    await mineBlock(60);

    let now = await block();
    expect(now.number)
      .eq(await web3().eth.getBlockNumber())
      .eq(startBlock.number + 1);
    expect(now.timestamp)
      .eq((await web3().eth.getBlock(now.number)).timestamp)
      .eq(startBlock.timestamp + 60);

    await mineBlocks(60, 10);

    now = await block();
    expect(now.number)
      .eq(await web3().eth.getBlockNumber())
      .eq(startBlock.number + 7);
    expect(now.timestamp)
      .eq((await web3().eth.getBlock(now.number)).timestamp)
      .eq(startBlock.timestamp + 60 + 60);

    expect(await estimatedBlockNumber(Date.now(), 10)).eq(now.number);
    expect(await estimatedBlockNumber(Date.now() - 10_000, 10)).eq(now.number - 1);
  });
});
