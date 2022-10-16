import type { Artifact, HardhatRuntimeEnvironment } from "./types";
import Web3 from "web3";
import _ from "lodash";
import { block, networks, web3 } from "../network";
import { contract, Contract, Options, waitForTxConfirmations } from "../contracts";
import { bn, bn18, BigNumberish } from "../utils";
import { HardhatUserConfig } from "hardhat/types";

export * from "./testing";

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
export async function setBalance(address: string, balance: BigNumberish) {
  await hre().network.provider.send("hardhat_setBalance", [address, "0x" + bn(balance).toString(16)]);
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
  waitForConfirmations: number = 0,
  timeoutInSeconds?: number
): Promise<T> {
  debug("deploying", contractName);
  const _artifact = artifact(contractName);
  const contractToDeploy = contract<T>(_artifact.abi, "");

  if (timeoutInSeconds) {
    contractToDeploy.transactionBlockTimeout = timeoutInSeconds;
    contractToDeploy.transactionPollingTimeout = timeoutInSeconds;
  }

  const tx = contractToDeploy.deploy({ data: _artifact.bytecode, arguments: constructorArgs }).send(opts);

  if (waitForConfirmations) {
    await waitForTxConfirmations(tx, waitForConfirmations);
  }

  const deployed = await tx;
  debug("deployed", contractName, deployed.options.address, "deployer", opts.from);
  tag(deployed.options.address, contractName);
  return contract<T>(_artifact.abi, deployed.options.address, deployed.options);
}

export function hardhatDefaultConfig() {
  require("dotenv").config();
  process.env.NETWORK = process.env.NETWORK?.toUpperCase() || "ETH";
  console.log(`🌐 network`, process.env.NETWORK, "blocknumber", process.env.BLOCK ? parseInt(process.env.BLOCK!) : "latest", "🌐");

  const networkUrl = (process.env as any)[`NETWORK_URL_${process.env.NETWORK}`];
  if (!networkUrl) console.error(`⚠️ expected NETWORK_URL_${process.env.NETWORK} in env`);
  process.env.NETWORK_URL = networkUrl;

  const etherscanKey = process.env[`ETHERSCAN_${process.env.NETWORK}`];
  if (!etherscanKey) console.error(`⚠️ expected ETHERSCAN_${process.env.NETWORK} in env`);

  const coinmarketcapKey = process.env.COINMARKETCAP;
  if (!coinmarketcapKey) console.error(`⚠️ expected COINMARKETCAP in env`);

  const config = {
    solidity: {
      compilers: [
        {
          version: "0.8.16",
          settings: {
            optimizer: {
              enabled: true,
              runs: 200,
            },
          },
        },
      ],
    },
    defaultNetwork: "hardhat",
    networks: {
      hardhat: {
        forking: {
          blockNumber: process.env.BLOCK ? parseInt(process.env.BLOCK!) : undefined,
          url: networkUrl,
        },
        blockGasLimit: 10e6,
        accounts: {
          passphrase: process.env.npm_package_name || "empty", //empty accounts
          accountsBalance: bn18(100).toString(),
        },
      },
    },
    typechain: {
      outDir: "typechain-hardhat",
      target: "web3-v1",
    },
    mocha: {
      timeout: 180_000,
      retries: 0,
      bail: true,
    },
    gasReporter: {
      currency: "USD",
      coinmarketcap: coinmarketcapKey,
      token: gasReporterConfig().token,
      gasPriceApi: gasReporterConfig().url,
      showTimeSpent: true,
    },
    etherscan: { apiKey: etherscanKey },
  };

  return _.merge(config, {
    networks: _.chain(networks)
      .mapKeys((n) => n.shortname)
      .mapValues((n) => ({ chainId: n.id, url: networkUrl }))
      .value(),
  }) as HardhatUserConfig;
}

export function gasReporterConfig() {
  switch (process.env.NETWORK) {
    case "ARB":
      return { token: "ETH", url: "https://api.arbiscan.io/api?module=proxy&action=eth_gasPrice" };
    case "OPT":
      return { token: "ETH", url: "https://api-optimistic.etherscan.io/api?module=proxy&action=eth_gasPrice" };
    case "BSC":
      return { token: "BNB", url: "https://api.bscscan.com/api?module=proxy&action=eth_gasPrice" };
    case "POLY":
      return { token: "MATIC", url: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice" };
    case "AVAX":
      return { token: "AVAX", url: "https://api.snowtrace.io/api?module=proxy&action=eth_gasPrice" };
    case "FTM":
      return { token: "FTM", url: "https://api.ftmscan.com/api?module=proxy&action=eth_gasPrice" };
    default:
      return {};
  }
}
