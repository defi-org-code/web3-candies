import _ from "lodash";
import Web3 from "web3";
import { BlockInfo, BlockNumber } from "./contracts";

export const ethChainId = 0x1;
export const bscChainId = 0x38;

/**
 * hardhat injected web3 instance, or the global singleton
 */
export function web3(): Web3 {
  if (web3Instance) return web3Instance;
  try {
    if (process.env.NODE) web3Instance = eval("require")("hardhat").web3;
  } catch (ignore) {}
  if (!web3Instance) throw new Error(`web3 undefined! call "setWeb3Instance" or install optional HardHat dependency`);
  return web3Instance;
}

let web3Instance: Web3;

export function setWeb3Instance(web3: any) {
  web3Instance = web3;
}

export async function account(num: number = 0): Promise<string> {
  return (await web3().eth.getAccounts())[num];
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
