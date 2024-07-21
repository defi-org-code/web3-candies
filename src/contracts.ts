import type { ContractOptions, ContractSendMethod } from "web3-eth-contract";
import type { EventLog, TransactionReceipt } from "web3-core";
import type { AbiItem } from "web3-utils";
import type { BlockTransactionString } from "web3-eth";
import BN from "bignumber.js";
import { bn } from "./utils";
import { chainId, estimateGasPrice, network, networks, web3 } from "./network";
import Web3 from "web3";

export type Contract = any;
export type Options = { from: string; maxPriorityFeePerGas?: BN.Value; maxFeePerGas?: BN.Value; value?: BN.Value };
export type BlockNumber = any;
export type BlockInfo = BlockTransactionString & { timestamp: number };
export type Receipt = TransactionReceipt;
export type Abi = AbiItem[];

export function contract<T extends Contract>(abi: Abi, address: string, options?: ContractOptions, w3?: Web3): T {
  const c = new (w3 ?? web3()).eth.Contract(abi, address, options) as T;
  (c as any).handleRevert = false;
  return c;
}

export function parseEvents(receipt: any, contractOrAbi: any): EventLog[] {
  const abi = contractOrAbi?.options?.jsonInterface || contractOrAbi;
  const abiCoder = web3().eth.abi;
  const abiEvents = abi.filter((desc :any) => desc.type === "event").map(
    (desc: any) => ({
      name: desc.name || "",
      inputs: desc.inputs || [],
      signature: abiCoder.encodeEventSignature(desc),
    })
  );
  const result: EventLog[] = [];

  receipt?.events?.forEach((e:any) => {
    const abiEvent = abiEvents.find((desc:any) => desc.signature === e.raw?.topics[0]);
    if (abiEvent)
      result.push({
        ...e,
        event: abiEvent.name,
        returnValues: abiCoder.decodeLog(abiEvent.inputs, e.raw?.data || "", e.raw?.topics.slice(1) || []),
      });
  });
  receipt?.logs?.forEach((log:any) => {
    const abiEvent = abiEvents.find((desc:any) => desc.signature === log.topics[0]);
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
  tx: any,
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

  const estimated = await (tx?.estimateGas({ ...options }) || web3().eth.estimateGas({ ...options }));
  options.gas = Math.floor(estimated * 1.2);

  const promiEvent = tx ? tx.send(options) : web3().eth.sendTransaction(options);

  let sentBlock = Number.POSITIVE_INFINITY;
  let receipt: any;
  let txHash = "";

  promiEvent.once("transactionHash", (r: any) => {
    txHash = r;
    callback?.onTxHash?.(r);
  });
  try {
    receipt = await promiEvent;
  } catch (error) {
    if (!(error as Error).message.toLowerCase().includes("failed to check for transaction receipt")) {
      throw error;
    }
  }

  if (!receipt) {
    receipt = await waitForReceipt(txHash);
  }

  if (!receipt) {
    throw new Error("Transaction failed");
  }

  if (confirmations > 1) {
    while ((await web3().eth.getTransactionCount(opts.from)) === nonce || (await web3().eth.getBlockNumber()) < (receipt as any).blockNumber + confirmations) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return receipt;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function waitForReceipt(txHash: string) {
  for (let i = 0; i < 30; ++i) {
    await delay(3_000);
    try {
      const receipt = await web3().eth.getTransactionReceipt(txHash);
      if (receipt) {
        return receipt;
      }
    } catch (error: any) {
      console.error("waitForReceipt error", error);
    }
  }
}
