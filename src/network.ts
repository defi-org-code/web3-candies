import _ from "lodash";
import Web3 from "web3";
import { BlockInfo, BlockNumber } from "./contracts";
import type { Artifact, HardhatRuntimeEnvironment } from "./hardhat/types";

export const ethChainId = 0x1;
export const bscChainId = 0x38;

/**
 * the global hardhat runtime environment
 */
export function hre(): HardhatRuntimeEnvironment & { web3: Web3 } {
  return require("hardhat");
}

/**
 * hardhat injected web3 instance, or the global singleton
 */
export function web3(): Web3 {
  if (web3GlobalSingleton) return web3GlobalSingleton;
  try {
    web3GlobalSingleton = hre().web3;
  } catch (e) {}
  if (!web3GlobalSingleton)
    throw new Error(`web3 undefined! call "setWeb3Instance" or install optional HardHat dependency`);
  return web3GlobalSingleton;
}

let web3GlobalSingleton: Web3;

export function setWeb3Instance(web3: any) {
  web3GlobalSingleton = web3;
}

export async function account(num: number = 0): Promise<string> {
  return (await web3().eth.getAccounts())[num];
}

export function artifact(name: string): Artifact {
  return hre().artifacts.readArtifactSync(name);
}

export function tag(address: string, name: string) {
  if ((hre() as any).tracer) (hre() as any).tracer.nameTags[address] = name;
}

export async function impersonate(...address: string[]) {
  console.log("impersonating", ...address);
  await hre().network.provider.send("hardhat_impersonateAccount", [...address]);
}

export async function resetNetworkFork(blockNumber: number = getNetworkForkingBlockNumber()) {
  console.log("resetNetworkFork to", blockNumber || "latest");
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

export function getNetworkForkingBlockNumber(): number {
  return _.get(hre().network.config, "forking.blockNumber");
}

export function getNetworkForkingUrl(): string {
  return _.get(hre().network.config, "forking.url");
}

export async function block(blockHashOrBlockNumber?: BlockNumber | string): Promise<BlockInfo> {
  const r = await web3().eth.getBlock(blockHashOrBlockNumber || "latest");
  r.timestamp = typeof r.timestamp == "number" ? r.timestamp : parseInt(r.timestamp);
  return r as BlockInfo;
}

export async function estimatedBlockNumber(timestamp: number, avgBlockDurationSec: number): Promise<number> {
  const current: number = await web3().eth.getBlockNumber();
  const diffMillis = Date.now() - timestamp;
  const diffBlocks = Math.round(diffMillis / 1000 / avgBlockDurationSec);
  return current - diffBlocks;
}

export async function mineBlocks(seconds: number, secondsPerBlock: number) {
  console.log(`mining blocks in a loop and advancing time by ${seconds} seconds, ${secondsPerBlock} seconds per block`);

  const startBlock = await block();
  const startTime = startBlock.timestamp;
  for (let i = 1; i <= Math.round(seconds / secondsPerBlock); i++) {
    await hre().network.provider.send("evm_increaseTime", [secondsPerBlock]);
    await hre().network.provider.send("evm_mine", [startTime + secondsPerBlock * i]);
  }

  const nowBlock = await block();
  console.log(
    "was: block",
    startBlock.number,
    "timestamp",
    new Date(Number(startBlock.timestamp) * 1000),
    "now: block",
    nowBlock.number,
    "timestamp",
    new Date(Number(nowBlock.timestamp) * 1000)
  );
  return nowBlock;
}

export async function mineBlock(seconds: number) {
  console.log(`mining 1 block and advancing time by ${seconds} seconds`);
  const startBlock = await block();

  await hre().network.provider.send("evm_increaseTime", [seconds]);
  await hre().network.provider.send("evm_mine", [startBlock.timestamp + seconds]);

  const nowBlock = await block();
  console.log(
    "was: block",
    startBlock.number,
    "timestamp",
    new Date(Number(startBlock.timestamp) * 1000),
    "now: block",
    nowBlock.number,
    "timestamp",
    new Date(Number(nowBlock.timestamp) * 1000)
  );
  return nowBlock;
}
