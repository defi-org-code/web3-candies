import type { BaseContract, BlockType } from "@typechain/web3-v1/static/types";
import type { Contract as ContractOrig, ContractOptions, ContractSendMethod } from "web3-eth-contract";
import type { EventLog, TransactionReceipt } from "web3-core";
import type { AbiItem } from "web3-utils";
import type { BlockTransactionString } from "web3-eth";
import type { NonPayableTransactionObject, PayableTransactionObject } from "./abi/types";
import BN from "bignumber.js";
import { bn } from "./utils";
import _, { result } from "lodash";
import { chainId, estimateGasPrice, network, networks, web3 } from "./network";
import Web3 from "web3";

const debug = require("debug")("web3-candies");

export type Contract = ContractOrig | BaseContract;
export type Options = { from: string; maxPriorityFeePerGas?: BN.Value; maxFeePerGas?: BN.Value; value?: BN.Value };
export type BlockNumber = BlockType;
export type BlockInfo = BlockTransactionString & { timestamp: number };
export type Receipt = TransactionReceipt;
export type Abi = AbiItem[];

export function contract<T extends Contract>(abi: Abi, address: string, options?: ContractOptions, w3?: Web3): T {
  const c = new (w3 ?? web3()).eth.Contract(abi, address, options) as T;

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
export async function sendAndWaitForConfirmations<T extends Contract | Receipt = Receipt>(
  tx: NonPayableTransactionObject<any> | PayableTransactionObject<any> | ContractSendMethod | null,
  opts: Options & { to?: string },
  confirmations: number = 0,
  autoGas?: "fast" | "med" | "slow",
  callback?: {
    onTxHash?: (txHash: string) => void;
    onTxReceipt?: (receipt: Receipt) => void;
  }
) {
  if (!tx && !opts.to) throw new Error("tx or opts.to must be specified");

  const [nonce, chain, price] = await Promise.all([web3().eth.getTransactionCount(opts.from), chainId(), autoGas ? estimateGasPrice() : Promise.resolve()]);
  const maxFeePerGas = BN.max(autoGas ? price?.[autoGas]?.max || 0 : 0, bn(opts.maxFeePerGas || 0), 0);
  const maxPriorityFeePerGas = BN.max(autoGas ? price?.[autoGas]?.tip || 0 : 0, bn(opts.maxPriorityFeePerGas || 0), 0);

  const options = {
    value: opts.value ? bn(opts.value).toFixed(0) : 0,
    from: opts.from,
    to: opts.to,
    gas: 0,
    nonce,
    maxFeePerGas: maxFeePerGas.isZero() ? undefined : maxFeePerGas.toFixed(0),
    maxPriorityFeePerGas: maxPriorityFeePerGas.isZero() ? undefined : maxPriorityFeePerGas.toFixed(0),
  };

  if (!network(chain).eip1559) {
    (options as any).gasPrice = options.maxFeePerGas;
    delete options.maxFeePerGas;
    delete options.maxPriorityFeePerGas;
  }

  debug(`estimating gas...`);
  const estimated = await (tx?.estimateGas({ ...options }) || web3().eth.estimateGas({ ...options }));
  debug(`estimated gas: ${estimated} +20% buffer`);
  options.gas = Math.floor(estimated * 1.2);

  debug(`sending tx...`, JSON.stringify(options));
  const promiEvent = tx ? tx.send(options) : web3().eth.sendTransaction(options);

  let sentBlock = Number.POSITIVE_INFINITY;
  let result: any;

  promiEvent.once("transactionHash", (r) => {
    callback?.onTxHash?.(r);
  });
  promiEvent.once("receipt", (r) => {
    sentBlock = r.blockNumber;
    result = r;
    callback?.onTxReceipt?.(r);
  });

  debug(`waiting for ${confirmations} confirmations...`);
  // const result = await promiEvent;

  while (!result || (await web3().eth.getTransactionCount(opts.from)) === nonce || (await web3().eth.getBlockNumber()) < sentBlock + confirmations) {
    await new Promise((r) => setTimeout(r, 1000));
  }

  return result as T;
}
