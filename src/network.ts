import _ from "lodash";
import Web3 from "web3";
import { BlockInfo, BlockNumber } from "./contracts";
import { hre } from "./hardhat";
const EthDater = require("ethereum-block-by-date");

interface IBlockByDate {
  date: string;
  block: number;
  timestamp: number;
}

export const ethChainId = 0x1;
export const bscChainId = 0x38;

/**
 * hardhat injected web3 instance, or the global singleton
 */
export function web3(): Web3 {
  if (web3Instance) return web3Instance;
  try {
    web3Instance = hre().web3;
  } catch (ignore) {}
  if (!web3Instance) throw new Error(`web3 undefined! call "setWeb3Instance" or install optional HardHat dependency`);
  return web3Instance;
}

let web3Instance: Web3;
let ethDaterInstance: any;

export function setWeb3Instance(web3: any) {
  web3Instance = web3;
  ethDaterInstance = new EthDater(web3);
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

export async function blockNumberByDate(date: string | number | Date): Promise<IBlockByDate> {
  if (!ethDaterInstance) ethDaterInstance = new EthDater(web3());
  return ethDaterInstance.getDate(date);
}

export async function blockNumbersEveryDate(
  period: "years" | "quarters" | "months" | "weeks" | "days" | "hours" | "minutes",
  startDate: string | number | Date,
  endDate: string | number | Date,
  duration?: number, // default 1
  after?: boolean // default true
) {
  if (!ethDaterInstance) ethDaterInstance = new EthDater(web3());
  return await ethDaterInstance.getEvery(period, startDate, endDate, duration, after);
}
