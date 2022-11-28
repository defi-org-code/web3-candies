import Web3 from "web3";
import type { BlockInfo, BlockNumber } from "./contracts";
import _ from "lodash";

const debug = require("debug")("web3-candies");

export type Network = { id: number; name: string; shortname: string };

/**
 * to extend: `const mynetworks = _.merge({}, networks, { eth: { foo: 123 }})`
 */
export const networks = {
  eth: { id: 0x1, name: "Ethereum", shortname: "eth" } as Network,
  bsc: { id: 0x38, name: "BinanceSmartChain", shortname: "bsc" } as Network,
  poly: { id: 0x89, name: "Polygon", shortname: "poly" } as Network,
  arb: { id: 42161, name: "Arbitrum", shortname: "arb" } as Network,
  avax: { id: 43114, name: "Avalanche", shortname: "avax" } as Network,
  oeth: { id: 10, name: "Optimism", shortname: "oeth" } as Network,
  ftm: { id: 250, name: "Fantom", shortname: "ftm" } as Network,
  one: { id: 1666600000, name: "Harmony", shortname: "one" } as Network,
  klay: { id: 8217, name: "Klaytn", shortname: "klay" } as Network,
};

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

export function hasWeb3Instance() {
  return !!web3Instance;
}

export async function currentNetwork() {
  if (process.env.NETWORK) {
    return _.find(networks, (n) => n.shortname === process.env.NETWORK?.toLowerCase());
  }
  if (hasWeb3Instance()) {
    const chainId = await web3().eth.getChainId();
    return _.find(networks, (n) => n.id === chainId);
  }
}

export async function chainId() {
  return (await currentNetwork())?.id || 0;
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

export async function findBlock(timestamp: number): Promise<BlockInfo> {
  const targetTimestampSecs = timestamp / 1000;
  const currentBlock = await block();
  if (targetTimestampSecs > currentBlock.timestamp) throw new Error(`${timestamp} is in the future`);

  let candidate = await block(currentBlock.number - 10_000);
  const avgBlockDurationSec = (currentBlock.timestamp - candidate.timestamp) / 10_000;
  debug(
    "searching for blocknumber at",
    new Date(timestamp).toString(),
    "current block",
    currentBlock.number,
    "average block duration",
    avgBlockDurationSec,
    "seconds",
    "starting at block",
    candidate.number
  );

  let closesDistance = Number.POSITIVE_INFINITY;
  while (Math.abs(candidate.timestamp - targetTimestampSecs) >= avgBlockDurationSec) {
    const distanceInSeconds = candidate.timestamp - targetTimestampSecs;
    const estDistanceInBlocks = Math.floor(distanceInSeconds / avgBlockDurationSec);
    if (Math.abs(estDistanceInBlocks) > closesDistance) break;

    closesDistance = Math.abs(estDistanceInBlocks);
    debug({ distanceInSeconds, estDistanceInBlocks });
    candidate = await block(candidate.number - estDistanceInBlocks);
  }

  debug("result", candidate.number, new Date(candidate.timestamp * 1000).toString());
  return candidate;
}
