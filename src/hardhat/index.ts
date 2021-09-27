import type { Artifact, HardhatRuntimeEnvironment } from "./types";
import Web3 from "web3";
import _ from "lodash";
import { block, web3 } from "../network";
import { contract, Contract, waitForTxConfirmations } from "../contracts";
import { SendOptions } from "web3-eth-contract";

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
    if ((hre() as any).tracer) (hre() as any).tracer.nameTags[address] = name;
  } catch (ignore) {}
}

export function artifact(name: string): Artifact {
  return hre().artifacts.readArtifactSync(name);
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

export async function mineBlocks(seconds: number, secondsPerBlock: number) {
  console.log(`mining blocks in a loop and advancing time by ${seconds} seconds, ${secondsPerBlock} seconds per block`);

  const startBlock = await block();
  for (let i = 1; i <= Math.round(seconds / secondsPerBlock); i++) {
    await hre().network.provider.send("evm_increaseTime", [secondsPerBlock]);
    await hre().network.provider.send("evm_mine");
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
  await hre().network.provider.send("evm_mine");

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

export async function deployArtifact<T extends Contract>(
  contractName: string,
  opts: SendOptions,
  constructorArgs?: any[],
  waitForConfirmations: number = 0
): Promise<T> {
  console.log("deploying", contractName);
  const _artifact = artifact(contractName);
  const tx = contract<T>(_artifact.abi, "").deploy({ data: _artifact.bytecode, arguments: constructorArgs }).send(opts);

  if (waitForConfirmations) {
    await waitForTxConfirmations(tx, waitForConfirmations);
  } else {
    console.log("not waiting for confirmations");
  }

  const deployed = await tx;
  console.log("deployed", contractName, deployed.options.address, "deployer", opts.from);
  tag(deployed.options.address, contractName);
  return contract<T>(_artifact.abi, deployed.options.address, deployed.options);
}
