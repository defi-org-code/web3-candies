import { expect } from "chai";
import { account, erc20s, ether, web3, bn9, zero, networks } from "../src";
import { deployArtifact, mineBlock, mineBlocks, hre, setBalance, useChaiBN, hardhatDefaultConfig } from "../src/hardhat";
import type { Example } from "../typechain-hardhat/contracts/Example.sol";

useChaiBN();

describe("hardhat", () => {
  it("hardhat env", async () => {
    expect(web3().version).eq(hre().web3.version);
  });

  it("quick deploy compiled artifact", async () => {
    expect(await web3().eth.getBalance(await account())).bignumber.gt(ether);
    const deployed = await deployArtifact<Example>("Example", { from: await account(), maxFeePerGas: bn9(1000), maxPriorityFeePerGas: bn9(5) }, [
      123,
      erc20s.eth.WETH().address,
      [456],
    ]);
    expect(deployed.options.address).not.empty;
    expect(await deployed.methods.deployer().call()).eq(await account());
  });

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

  it("setBalance", async () => {
    await setBalance(await account(1), zero);
    expect(await web3().eth.getBalance(await account(1))).bignumber.zero;
    await setBalance(await account(1), ether);
    expect(await web3().eth.getBalance(await account(1))).bignumber.eq(ether);
  });

  it("default hardhat config with all supported networks", async () => {
    const config = hardhatDefaultConfig();
    expect(config.defaultNetwork).eq("hardhat");
    expect(config.networks!.hardhat).not.undefined;
    expect(config.networks!.eth!.chainId).eq(networks.eth.id);
    expect(config.networks!.bsc!.chainId).eq(networks.bsc.id);
  });
});
