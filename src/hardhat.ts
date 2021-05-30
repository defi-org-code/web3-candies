import _ from "lodash";
import { Artifact } from "hardhat/types";

/**
 * the global hardhat runtime environment
 */
export function hre() {
  return require("hardhat");
}

/**
 * hardhat injected web3 instance
 */
export function web3() {
  return hre().web3;
}

export function artifact(name: string): Artifact {
  return hre().artifacts.readArtifactSync(name);
}

export function tag(address: string, name: string) {
  if (hre().tracer) hre().tracer.nameTags[address] = name;
}

export async function impersonate(...address: string[]) {
  console.log("impersonating", ...address);
  await hre().network.provider.send("hardhat_impersonateAccount", [...address]);
}

export async function resetNetworkFork(blockNumber: number = getNetworkForkingBlockNumber()) {
  console.log("resetNetworkFork");
  await hre().network.provider.send("hardhat_reset", [
    {
      forking: {
        blockNumber,
        jsonRpcUrl: getNetworkForkingUrl(),
      },
    },
  ]);
  console.log("now block", await web3().eth.getBlockNumber());
}

export async function mineBlocks(seconds: number) {
  const secondsPerBlock = 13;
  console.log(`mining blocks and advancing time by ${seconds} seconds, ${secondsPerBlock} seconds per block`);

  const startBlock = await web3().eth.getBlock("latest");
  for (let i = 0; i < Math.round(seconds / secondsPerBlock); i++) {
    await hre().network.provider.send("evm_increaseTime", [secondsPerBlock]);
    await hre().network.provider.send("evm_mine", [1 + startBlock.timestamp + secondsPerBlock * i]);
  }

  const nowBlock = await web3().eth.getBlock("latest");
  console.log("was block", startBlock.number, "now block", nowBlock.number);
  console.log("was block time", startBlock.timestamp, "now block time", nowBlock.timestamp);
}

export async function mineOneBlock(seconds: number) {
  console.log(`mining one block and advancing time by ${seconds} seconds`);
  const startBlock = await web3().eth.getBlock("latest");

  await hre().network.provider.send("evm_increaseTime", [seconds]);
  await hre().network.provider.send("evm_mine", [startBlock.timestamp + seconds]);

  const nowBlock = await web3().eth.getBlock("latest");
  console.log("was block", startBlock.number, "now block", nowBlock.number);
  console.log("was block time", startBlock.timestamp, "now block time", nowBlock.timestamp);
}

export function getNetworkForkingBlockNumber() {
  return _.get(hre().network.config, "forking.blockNumber");
}

export function getNetworkForkingUrl() {
  return _.get(hre().network.config, "forking.url");
}
