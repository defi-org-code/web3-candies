import type { CallOptions, Contract as ContractOrig, ContractOptions, SendOptions } from "web3-eth-contract";
import type { BaseContract, BlockType } from "@typechain/web3-v1/static/types";
import type { TransactionReceipt } from "web3-core";
import type { AbiItem } from "web3-utils";
import type { BlockTransactionString } from "web3-eth";
import { zeroAddress } from "./utils";
import { web3 } from "./network";
import BN from "bn.js";
import _ from "lodash";
const debug = require("debug")("web3-candies");

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

export function parseEvents(contractOrAbi: Contract | Abi, tx: Receipt) {
  const abi = _.get(contractOrAbi, ["options", "jsonInterface"], contractOrAbi) as Abi;
  const address = _.get(contractOrAbi, ["options", "address"], zeroAddress) as string;
  if (abi !== contractOrAbi) require("web3-parse-receipt-events")(abi, address, tx);

  const abiCoder = web3().eth.abi;
  const events = tx.events!;

  _(events)
    .keys()
    .filter((k) => _.isNumber(_.toNumber(k)))
    .forEach((n) => {
      const event = events[n];
      if ((event as any).signature) return;

      const descriptor = _(abi)
        .filter((desc) => desc.type === "event")
        .map((desc) => ({
          ...desc,
          signature: _.get(desc, "signature", abiCoder.encodeEventSignature(desc)),
        }))
        .find((desc) => desc.signature === _.get(event, ["raw", "topics", 0]));
      if (!descriptor) return;

      event.event = descriptor.name!;
      (event as any).signature = descriptor.signature!;
      event.returnValues = abiCoder.decodeLog(descriptor.inputs!, event.raw!.data, event.raw!.topics.slice(1));

      events[event.event] = event;
      delete event.returnValues.__length__;
      delete events[n];
    });
  return events;
}

export async function waitForTxConfirmations(tx: any, confirmations: number) {
  debug(`waiting for ${confirmations} confirmations...`);
  await new Promise<void>((res) => waitConfirmations(tx, res, confirmations));
  return await tx;
}

function waitConfirmations(tx: any, res: () => void, requiredConfirms: number) {
  tx.once("confirmation", (confNumber: number, receipt: Receipt, blockHash: string) => {
    debug("confirmed", confNumber, "blocks", receipt.blockNumber, blockHash);
    if (confNumber >= requiredConfirms) {
      res();
    } else {
      waitConfirmations(tx, res, requiredConfirms);
    }
  });
}
