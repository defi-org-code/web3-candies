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
  blockNumberByDate,
} from "../src";
import { blockNumbersEveryDate } from "../dist";

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

  it("first block of the year", async () => {
    const startOfYear = new Date(Date.UTC(2021, 0));
    const result = await blockNumberByDate(startOfYear);
    const results = await blockNumbersEveryDate("years", startOfYear, startOfYear);
    expect(results).length(1);
    expect(results[0]).deep.eq(result);

    expect(result.block).eq(11565019);
    expect(result.timestamp).eq(1609459200);
    expect(result.date).eq("2021-01-01T00:00:00Z");
  });
});
