import { TransactionReceipt } from "web3-core";
import { CallOptions, Contract as ContractOrig, ContractOptions, SendOptions } from "web3-eth-contract";
import { BaseContract, BlockType } from "@typechain/web3-v1/static/types";
import { artifact, tag, web3 } from "./hardhat";
const parseReceiptEvents = require("web3-parse-receipt-events");

export type Contract = ContractOrig | BaseContract;
export type Options = CallOptions | SendOptions | ContractOptions;
export type BlockNumber = BlockType;
export type Receipt = TransactionReceipt;

export function contract<T extends Contract>(abi: string | any[], address: string = "", options?: ContractOptions): T {
  const c = new (web3().eth.Contract)(abi, address, options) as T;
  c.handleRevert = true;
  return c;
}

export async function deployContract<T extends Contract>(
  name: string,
  opts: SendOptions,
  constructorArgs?: any[]
): Promise<T> {
  const _artifact = artifact(name);
  const deployed = await contract<T>(_artifact.abi)
    .deploy({ data: _artifact.bytecode, arguments: constructorArgs })
    .send(opts);
  console.log("deployed", name, deployed.options.address, "from", opts.from);
  tag(deployed.options.address, name);
  return deployed as T;
  // return contract<T>(_artifact.abi, deployed.options.address, deployed.options);
}

export function parseEvents(abis: any[], address: string, tx: Receipt) {
  parseReceiptEvents(abis, address, tx);
}
