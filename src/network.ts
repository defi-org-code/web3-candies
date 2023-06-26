import BN from "bignumber.js";
import _ from "lodash";
import Web3 from "web3";
import type { BlockInfo, BlockNumber, Contract } from "./contracts";
import { erc20sData } from "./erc20";
import { keepTrying, timeout } from "./timing";
import { eqIgnoreCase, median, zeroAddress } from "./utils";
import type { EventData } from "web3-eth-contract";

const debug = require("debug")("web3-candies");

/**
 * to extend: `const mynetworks = _.merge({}, networks, { eth: { foo: 123 }})`
 */
export const networks = {
  eth: {
    id: 1,
    name: "Ethereum",
    shortname: "eth",
    native: { address: zeroAddress, symbol: "ETH", decimals: 18, logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg" },
    wToken: erc20sData.eth.WETH,
    publicRpcUrl: "https://eth.llamarpc.com",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
    explorer: "https://etherscan.io",
    baseGasPrice: 0,
    eip1559: true,
  },
  bsc: {
    id: 56,
    name: "BinanceSmartChain",
    shortname: "bsc",
    native: { address: zeroAddress, symbol: "BNB", decimals: 18, logoUrl: "https://app.1inch.io/assets/images/network-logos/bsc_2.svg" },
    wToken: erc20sData.bsc.WBNB,
    publicRpcUrl: "https://bsc-dataseed.binance.org",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/bsc_2.svg",
    explorer: "https://bscscan.com",
    baseGasPrice: 3 * 1e9,
    eip1559: false,
  },
  poly: {
    id: 137,
    name: "Polygon",
    shortname: "poly",
    native: { address: zeroAddress, symbol: "MATIC", decimals: 18, logoUrl: "https://app.1inch.io/assets/images/network-logos/polygon.svg" },
    wToken: erc20sData.poly.WMATIC,
    publicRpcUrl: "https://polygon-rpc.com",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/polygon.svg",
    explorer: "https://polygonscan.com",
    baseGasPrice: 0,
    eip1559: true,
  },
  arb: {
    id: 42161,
    name: "Arbitrum",
    shortname: "arb",
    native: { address: zeroAddress, symbol: "ETH", decimals: 18, logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg" },
    wToken: erc20sData.arb.WETH,
    publicRpcUrl: "https://arb1.arbitrum.io/rpc",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/arbitrum.svg",
    explorer: "https://arbiscan.io",
    baseGasPrice: 0.12 * 1e9,
    eip1559: true,
  },
  avax: {
    id: 43114,
    name: "Avalanche",
    shortname: "avax",
    native: { address: zeroAddress, symbol: "AVAX", decimals: 18, logoUrl: "https://app.1inch.io/assets/images/network-logos/avalanche.svg" },
    wToken: erc20sData.avax.WAVAX,
    publicRpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/avalanche.svg",
    explorer: "https://snowtrace.io",
    baseGasPrice: 0,
    eip1559: true,
  },
  oeth: {
    id: 10,
    name: "Optimism",
    shortname: "oeth",
    native: { address: zeroAddress, symbol: "ETH", decimals: 18, logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg" },
    wToken: erc20sData.oeth.WETH,
    publicRpcUrl: "https://mainnet.optimism.io",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/optimism.svg",
    explorer: "https://optimistic.etherscan.io",
    baseGasPrice: 0,
    eip1559: true,
  },
  ftm: {
    id: 250,
    name: "Fantom",
    shortname: "ftm",
    native: { address: zeroAddress, symbol: "FTM", decimals: 18, logoUrl: "https://app.1inch.io/assets/images/network-logos/fantom.svg" },
    wToken: erc20sData.ftm.WFTM,
    publicRpcUrl: "https://rpc.ftm.tools",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/fantom.svg",
    explorer: "https://ftmscan.com",
    baseGasPrice: 0,
    eip1559: true,
  },
  glmr: {
    id: 1284,
    name: "Moonbeam",
    shortname: "glmr",
    native: { address: zeroAddress, symbol: "GLMR", decimals: 18, logoUrl: "https://moonscan.io/images/svg/brands/mainbrand-1.svg" },
    wToken: erc20sData.glmr.WGLMR,
    publicRpcUrl: "https://rpc.api.moonbeam.network",
    logoUrl: "https://moonscan.io/images/svg/brands/mainbrand-1.svg",
    explorer: "https://moonscan.io",
    baseGasPrice: 0,
    eip1559: true,
  },
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

export function network(chainId: number) {
  return _.find(networks, (n) => n.id === chainId)!;
}

export async function chainId(w3?: Web3) {
  if (process.env.NETWORK) {
    return _.find(networks, (n) => n.shortname === process.env.NETWORK?.toLowerCase())!.id;
  }
  return await (w3 || web3()).eth.getChainId();
}

export function isWrappedToken(chainId: number, address: string) {
  return eqIgnoreCase(network(chainId).wToken.address, address);
}

export async function account(num: number = 0): Promise<string> {
  return (await web3().eth.getAccounts())[num];
}

export async function block(blockHashOrBlockNumber?: BlockNumber | string): Promise<BlockInfo> {
  const r = await web3().eth.getBlock(blockHashOrBlockNumber || "latest");
  r.timestamp = typeof r.timestamp == "number" ? r.timestamp : parseInt(r.timestamp);
  return r as BlockInfo;
}

export async function findBlock(timestamp: number): Promise<BlockInfo> {
  const targetTimestampSecs = timestamp / 1000;
  const currentBlock = await block();
  if (targetTimestampSecs > currentBlock.timestamp) throw new Error(`findBlock: ${new Date(timestamp)} is in the future`);

  let candidate = await block(currentBlock.number - 10_000);
  const avgBlockDurationSec = Math.max(1, (currentBlock.timestamp - candidate.timestamp) / 10_000);
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

  let closestDistance = Number.POSITIVE_INFINITY;
  while (Math.abs(candidate.timestamp - targetTimestampSecs) >= avgBlockDurationSec) {
    const distanceInSeconds = candidate.timestamp - targetTimestampSecs;
    const estDistanceInBlocks = Math.floor(distanceInSeconds / avgBlockDurationSec);
    if (Math.abs(estDistanceInBlocks) > closestDistance) break;

    closestDistance = Math.abs(estDistanceInBlocks);
    const targeting = candidate.number - estDistanceInBlocks;
    if (targeting < 0) throw new Error(`findBlock: target block is before the genesis block at ${new Date((await block(0)).timestamp * 1000)}}`);
    debug({ distanceInSeconds, estDistanceInBlocks, targeting });
    candidate = await block(targeting);
  }

  debug("result", candidate.number, new Date(candidate.timestamp * 1000).toString());
  return candidate;
}

export async function switchMetaMaskNetwork(chainId: number) {
  const provider = (web3() as any).provider || web3().currentProvider;
  if (!provider) throw new Error(`no provider`);

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: Web3.utils.toHex(chainId) }],
    });
  } catch (error: any) {
    // if unknown chain, add chain
    if (error.code === 4902) {
      const info = network(chainId);
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: Web3.utils.toHex(chainId),
            chainName: info.name,
            nativeCurrency: info.native,
            rpcUrls: [info.publicRpcUrl],
            blockExplorerUrls: [info.explorer],
            iconUrls: [info.logoUrl],
          },
        ],
      });
    } else throw error;
  }
}

/**
 * @returns median gas prices for slow (10th percentile), med (50th percentile) and fast (90th percentile) of the last {length = 5} blocks, in wei
 */
export async function estimateGasPrice(
  percentiles: number[] = [10, 50, 90],
  length: number = 5,
  w3?: Web3
): Promise<{
  slow: { max: BN; tip: BN };
  med: { max: BN; tip: BN };
  fast: { max: BN; tip: BN };
  baseFeePerGas: BN;
  pendingBlockNumber: number;
  pendingBlockTimestamp: number;
}> {
  if (process.env.NETWORK_URL && !w3) w3 = new Web3(process.env.NETWORK_URL);
  w3 = w3 || web3();

  return await keepTrying(async () => {
    const [chain, pendingBlock, history] = await Promise.all([
      chainId(w3),
      w3!.eth.getBlock("pending"),
      !!w3!.eth.getFeeHistory ? w3!.eth.getFeeHistory(length, "pending", percentiles) : Promise.resolve({ reward: [] }),
    ]);

    const baseFeePerGas = BN.max(pendingBlock.baseFeePerGas || 0, network(chain).baseGasPrice);

    const slow = median(_.map(history.reward, (r) => BN(r[0], 16)));
    const med = median(_.map(history.reward, (r) => BN(r[1], 16)));
    const fast = median(_.map(history.reward, (r) => BN(r[2], 16)));

    return {
      slow: { max: baseFeePerGas.times(1).plus(slow).integerValue(), tip: slow.integerValue() },
      med: { max: baseFeePerGas.times(1.1).plus(med).integerValue(), tip: med.integerValue() },
      fast: { max: baseFeePerGas.times(1.25).plus(fast).integerValue(), tip: fast.integerValue() },
      baseFeePerGas,
      pendingBlockNumber: pendingBlock.number,
      pendingBlockTimestamp: BN(pendingBlock.timestamp).toNumber(),
    };
  });
}

export async function getPastEvents(params: {
  contract: Contract;
  eventName: string | "all";
  filter: { [key: string]: string | number };
  fromBlock: number;
  toBlock?: number;
  minDistanceBlocks?: number;
  maxDistanceBlocks?: number;
  latestBlock?: number;
  iterationTimeoutMs?: number;
}): Promise<EventData[]> {
  params.toBlock = params.toBlock || Number.MAX_VALUE;
  params.maxDistanceBlocks = params.maxDistanceBlocks || Number.MAX_VALUE;
  params.minDistanceBlocks = Math.min(params.minDistanceBlocks || 1000, params.maxDistanceBlocks);
  params.iterationTimeoutMs = params.iterationTimeoutMs || 5000;
  params.latestBlock = params.latestBlock || (await web3().eth.getBlockNumber());
  params.fromBlock = params.fromBlock < 0 ? params.latestBlock + params.fromBlock : params.fromBlock;
  params.toBlock = Math.min(params.latestBlock, params.toBlock);
  const distance = params.toBlock - params.fromBlock;
  debug(`getPastEvents ${params.eventName} ${params.fromBlock} - ${params.toBlock} (${distance})`);

  try {
    if (!params.maxDistanceBlocks || distance <= params.maxDistanceBlocks)
      return await timeout(
        () =>
          params.contract.getPastEvents((params.eventName === "all" ? undefined : params.eventName) as any, {
            filter: params.filter,
            fromBlock: params.fromBlock,
            toBlock: params.toBlock,
          }),
        distance > params.minDistanceBlocks ? params.iterationTimeoutMs : 5 * 60 * 1000
      );
  } catch (e: any) {}

  if (distance <= params.minDistanceBlocks) return await getPastEvents(params);
  else
    return (await getPastEvents({ ...params, toBlock: Math.floor(params.fromBlock + distance / 2) })).concat(
      await getPastEvents({ ...params, fromBlock: Math.floor(params.fromBlock + distance / 2) + 1 })
    );
}
