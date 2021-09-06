import { expect } from "chai";
import { useChaiBN, web3, mineBlock, mineBlocks } from "../src";

useChaiBN();

describe("hardhat", () => {
  it("mine block", async () => {
    const startBlock = await web3().eth.getBlock("latest");
    await mineBlock(1);
    await mineBlock(1);
    await mineBlock(1);
    const nowBlock = await web3().eth.getBlock("latest");
    expect(nowBlock.number).eq(startBlock.number + 3);
    expect(nowBlock.timestamp).gte(parseInt(startBlock.timestamp.toString()) + 3);
  });

  it("mine blocks in a loop", async () => {
    const startBlock = await web3().eth.getBlock("latest");
    await mineBlocks(100, 2);
    const nowBlock = await web3().eth.getBlock("latest");
    expect(nowBlock.number).eq(startBlock.number + 50);
    expect(nowBlock.timestamp).gte(parseInt(startBlock.timestamp.toString()) + 100);
  });
});
