import type { BaseContract, BlockType } from "@typechain/web3-v1/static/types";
import type { CallOptions, Contract as ContractOrig, ContractOptions, SendOptions } from "web3-eth-contract";
import type { EventLog, PromiEvent, TransactionReceipt } from "web3-core";
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

export async function waitForConfirmations<T>(sendFn: () => PromiEvent<T>, from: string, confirmations: number = 0): Promise<T> {
  debug(`waiting for ${confirmations} confirmations...`);
  const nonce = await web3().eth.getTransactionCount(from);

  const promiEvent = sendFn();
  let sentBlock = Number.POSITIVE_INFINITY;
  promiEvent.once("receipt", (r) => (sentBlock = r.blockNumber));

  const result = await promiEvent;

  while ((await web3().eth.getTransactionCount(from)) === nonce || (await web3().eth.getBlockNumber()) < sentBlock + confirmations) {
    await new Promise((r) => setTimeout(r, 1000));
  }

  return result;
}
