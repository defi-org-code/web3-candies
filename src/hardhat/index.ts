import type { Artifact, HardhatRuntimeEnvironment } from "./types";
import Web3 from "web3";
import _ from "lodash";
import { block, networks, web3 } from "../network";
import { contract, Contract, Options, waitForTxConfirmations } from "../contracts";
import BN from "bn.js";
import { bn18 } from "../utils";
import { HardhatUserConfig } from "hardhat/types";
const debug = require("debug")("web3-candies");

/**
 * the global hardhat runtime environment
 */
export function hre(): HardhatRuntimeEnvironment & { web3: Web3 } {
  try {
    return require("hardhat");
  } catch (e) {
    throw new Error("optional HardHat dependency not installed!");
  }
}

/**
 * optionally tag the address as name with HRE tracer
 */
export function tag(address: string, name: string) {
  try {
    if ((hre() as any).tracer) {
      (hre() as any).tracer.nameTags[address] = name;
    }
  } catch (ignore) {}
}

export function artifact(name: string): Artifact {
  return hre().artifacts.readArtifactSync(name);
}

export async function impersonate(...address: string[]) {
  debug("impersonating", ...address);
  await hre().network.provider.send("hardhat_impersonateAccount", [...address]);
}

/**
 * Set native currency balance (ETH, BNB etc)
 */
export async function setBalance(address: string, balance: string | number | BN) {
  await hre().network.provider.send("hardhat_setBalance", [address, hre().web3.utils.toHex(balance)]);
}

export async function resetNetworkFork(blockNumber: number = getNetworkForkingBlockNumber()) {
  debug("resetNetworkFork to", blockNumber || "latest");
  await hre().network.provider.send("hardhat_reset", [
    {
      forking: {
        blockNumber,
        jsonRpcUrl: getNetworkForkingUrl(),
      },
    },
  ]);
  debug("now block", await web3().eth.getBlockNumber());
}

export function getNetworkForkingBlockNumber(): number {
  return _.get(hre().network.config, ["forking", "blockNumber"]);
}

export function getNetworkForkingUrl(): string {
  return _.get(hre().network.config, ["forking", "url"]);
}

export async function mineBlocks(seconds: number, secondsPerBlock: number) {
  debug(`mining blocks in a loop and advancing time by ${seconds} seconds, ${secondsPerBlock} seconds per block`);

  const startBlock = await block();
  for (let i = 1; i <= Math.round(seconds / secondsPerBlock); i++) {
    await hre().network.provider.send("evm_increaseTime", [secondsPerBlock]);
    await hre().network.provider.send("evm_mine");
  }

  const nowBlock = await block();
  debug(
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
  debug(`mining 1 block and advancing time by ${seconds} seconds`);
  const startBlock = await block();
  await hre().network.provider.send("evm_increaseTime", [seconds]);
  await hre().network.provider.send("evm_mine");

  const nowBlock = await block();
  debug(
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

export async function deployArtifact<T extends Contract>(
  contractName: string,
  opts: Options & { from: string },
  constructorArgs?: any[],
  waitForConfirmations: number = 0
): Promise<T> {
  debug("deploying", contractName);
  const _artifact = artifact(contractName);
  const tx = contract<T>(_artifact.abi, "").deploy({ data: _artifact.bytecode, arguments: constructorArgs }).send(opts);

  if (waitForConfirmations) {
    await waitForTxConfirmations(tx, waitForConfirmations);
  }

  const deployed = await tx;
  debug("deployed", contractName, deployed.options.address, "deployer", opts.from);
  tag(deployed.options.address, contractName);
  return contract<T>(_artifact.abi, deployed.options.address, deployed.options);
}

export function gasReporterConfig() {
  switch (process.env.NETWORK) {
    case "BSC":
      return { token: "BNB", url: "https://api.bscscan.com/api?module=proxy&action=eth_gasPrice" };
    case "POLY":
      return { token: "MATIC", url: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice" };
    case "AVAX":
      return { token: "AVAX", url: "https://api.snowtrace.io/api?module=proxy&action=eth_gasPrice" };
    default:
      return {};
  }
}

export function hardhatDefaultConfig() {
  require("dotenv").config();
  process.env.NETWORK = process.env.NETWORK?.toUpperCase() || "ETH";
  console.log(`🌐 network`, process.env.NETWORK, "blocknumber", process.env.BLOCK, "🌐");
  return {
    solidity: {
      version: "0.8.10",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
    defaultNetwork: "hardhat",
    networks: {
      hardhat: {
        forking: {
          blockNumber: process.env.BLOCK ? parseInt(process.env.BLOCK!) : undefined,
          url: (process.env as any)[`NETWORK_URL_${process.env.NETWORK}`] || "",
        },
        blockGasLimit: 10e6,
        accounts: {
          accountsBalance: bn18(10e6).toString(),
        },
      },
      eth: {
        chainId: networks.eth.id,
        url: process.env.NETWORK_URL_ETH || "",
      },
      bsc: {
        chainId: networks.bsc.id,
        url: process.env.NETWORK_URL_BSC || "",
      },
      poly: {
        chainId: networks.poly.id,
        url: process.env.NETWORK_URL_POLY || "",
      },
      avax: {
        chainId: networks.avax.id,
        url: process.env.NETWORK_URL_AVAX || "",
      },
    },
    typechain: {
      outDir: "typechain-hardhat",
      target: "web3-v1",
    },
    mocha: {
      timeout: 180_000,
      retries: 0,
    },
    gasReporter: {
      currency: "USD",
      coinmarketcap: process.env.COINMARKETCAP,
      token: gasReporterConfig().token,
      gasPriceApi: gasReporterConfig().url,
      showTimeSpent: true,
    },
    etherscan: {
      apiKey: process.env[`ETHERSCAN_${process.env.NETWORK}`],
    },
  } as HardhatUserConfig;
}
