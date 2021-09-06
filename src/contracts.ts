import type { CallOptions, Contract as ContractOrig, ContractOptions, SendOptions } from "web3-eth-contract";
import type { BaseContract, BlockType } from "@typechain/web3-v1/static/types";
import type { TransactionReceipt } from "web3-core";
import type { AbiItem } from "web3-utils";
import type { BlockTransactionString } from "web3-eth";
import { web3 } from "./network";
import { artifact, tag } from "./hardhat";

export type Contract = ContractOrig | BaseContract;
export type Options = CallOptions | SendOptions | ContractOptions;
export type BlockNumber = BlockType;
export type BlockInfo = BlockTransactionString & { timestamp: number };
export type Receipt = TransactionReceipt;
export type Abi = AbiItem[];

export function contract<T extends Contract>(abi: Abi, address: string, options?: ContractOptions): T {
  const c = new (web3().eth.Contract)(abi, address, options) as T;
  c.handleRevert = true;
  return c;
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
    console.log("waiting for confirmations...");
    await new Promise<void>((res) => waitConfirmations(tx, res, waitForConfirmations));
  } else {
    console.log("not waiting for confirmations");
  }

  const deployed = await tx;
  console.log("deployed", contractName, deployed.options.address, "deployer", opts.from);
  tag(deployed.options.address, contractName);
  return contract<T>(_artifact.abi, deployed.options.address, deployed.options);
}

export function parseEvents(c: Contract, tx: TransactionReceipt) {
  require("web3-parse-receipt-events")(c.options.jsonInterface, c.options.address, tx);
}

function waitConfirmations(tx: any, res: () => void, requiredConfirms: number) {
  tx.once("confirmation", (confNumber: number, receipt: Receipt, blockHash: string) => {
    console.log("confirmed", confNumber, "blocks", receipt.blockNumber, blockHash);
    if (confNumber >= requiredConfirms) {
      res();
    } else {
      waitConfirmations(tx, res, requiredConfirms);
    }
  });
}
