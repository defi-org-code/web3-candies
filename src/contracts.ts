import type { CallOptions, Contract as ContractOrig, ContractOptions, SendOptions } from "web3-eth-contract";
import type { BaseContract, BlockType } from "@typechain/web3-v1/static/types";
import type { TransactionReceipt } from "web3-core";
import type { AbiItem } from "web3-utils";
import type { BlockTransactionString } from "web3-eth";
import { web3 } from "./network";
import BN from "bn.js";

export type Contract = ContractOrig | BaseContract;
export type Options = CallOptions | SendOptions | ContractOptions | { maxFeePerGas?: BN | string | number; maxPriorityFeePerGas?: BN | string | number };
export type BlockNumber = BlockType;
export type BlockInfo = BlockTransactionString & { timestamp: number };
export type Receipt = TransactionReceipt;
export type Abi = AbiItem[];

export function contract<T extends Contract>(abi: Abi, address: string, options?: ContractOptions): T {
  const c = new (web3().eth.Contract)(abi, address, options) as T;
  c.handleRevert = true;
  return c;
}

export function parseEvents(c: Contract, tx: Receipt) {
  require("web3-parse-receipt-events")(c.options.jsonInterface, c.options.address, tx);
  return tx.events!;
}

export async function waitForTxConfirmations(tx: any, confirmations: number) {
  console.log(`waiting for ${confirmations} confirmations...`);
  await new Promise<void>((res) => waitConfirmations(tx, res, confirmations));
  return await tx;
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
