import { TransactionReceipt } from "web3-core";
import { CallOptions, Contract as ContractOrig, ContractOptions, SendOptions } from "web3-eth-contract";
import { BaseContract, BlockType } from "@typechain/web3-v1/static/types";
import { AbiItem } from "web3-utils";
import { BlockTransactionString } from "web3-eth";
import { artifact, tag, web3 } from "./network";

export type Contract = ContractOrig | BaseContract;
export type Options = CallOptions | SendOptions | ContractOptions;
export type BlockNumber = BlockType;
export type BlockInfo = BlockTransactionString & { timestamp: number };
export type Receipt = TransactionReceipt;
export type Abi = AbiItem | AbiItem[];

export function contract<T extends Contract>(abi: Abi, address: string, options?: ContractOptions): T {
  const c = new (web3().eth.Contract)(abi, address, options) as T;
  c.handleRevert = true;
  return c;
}

export async function deployArtifact<T extends Contract>(
  contractName: string,
  opts: SendOptions,
  constructorArgs?: any[]
): Promise<T> {
  const _artifact = artifact(contractName);
  const deployed = await contract<T>(_artifact.abi, "")
    .deploy({ data: _artifact.bytecode, arguments: constructorArgs })
    .send(opts);
  console.log("deployed", contractName, deployed.options.address, "deployer", opts.from);
  tag(deployed.options.address, contractName);
  return contract<T>(_artifact.abi, deployed.options.address, deployed.options);
}

export function parseEvents(c: Contract, tx: TransactionReceipt) {
  require("web3-parse-receipt-events")(c.options.jsonInterface, c.options.address, tx);
}
