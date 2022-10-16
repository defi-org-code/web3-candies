import type { BaseContract, BlockType } from "@typechain/web3-v1/static/types";
import type { CallOptions, Contract as ContractOrig, ContractOptions, SendOptions } from "web3-eth-contract";
import type { EventLog, TransactionReceipt } from "web3-core";
import type { AbiItem } from "web3-utils";
import type { BlockTransactionString } from "web3-eth";
import type { BigNumberish } from "./utils";
import { web3 } from "./network";
import _ from "lodash";

const debug = require("debug")("web3-candies");

export type Contract = ContractOrig | BaseContract;
export type Options = CallOptions | SendOptions | ContractOptions | { maxFeePerGas?: BigNumberish; maxPriorityFeePerGas?: BigNumberish };
export type BlockNumber = BlockType;
export type BlockInfo = BlockTransactionString & { timestamp: number };
export type Receipt = TransactionReceipt;
export type Abi = AbiItem[];

export function contract<T extends Contract>(abi: Abi, address: string, options?: ContractOptions): T {
  const c = new (web3().eth.Contract)(abi, address, options) as T;
  c.handleRevert = false;
  return c;
}

export function parseEvents(receipt: Receipt, contractOrAbi: Contract | Abi): EventLog[] {
  const abi = _.get(contractOrAbi, ["options", "jsonInterface"], contractOrAbi) as Abi;
  const abiCoder = web3().eth.abi;
  const abiEvents = _(abi)
    .filter((desc) => desc.type === "event")
    .map((desc) => ({
      name: desc.name || "",
      inputs: desc.inputs || [],
      signature: abiCoder.encodeEventSignature(desc),
    }))
    .value();

  const result: EventLog[] = [];

  _.forEach(receipt.events, (e) => {
    const abiEvent = abiEvents.find((desc) => desc.signature === e.raw?.topics[0]);
    if (abiEvent)
      result.push({
        ...e,
        event: abiEvent.name,
        returnValues: abiCoder.decodeLog(abiEvent.inputs, e.raw?.data || "", e.raw?.topics.slice(1) || []),
      });
  });
  _.forEach(receipt.logs, (log) => {
    const abiEvent = abiEvents.find((desc) => desc.signature === log.topics[0]);
    if (abiEvent)
      result.push({
        event: abiEvent.name,
        returnValues: abiCoder.decodeLog(abiEvent.inputs, log.data, log.topics.slice(1)),
        ...log,
      });
  });
  return result;
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
