const { readFileSync } = require("fs");
const { join, relative, resolve } = require("path");
const { createBarrelFiles, extractAbi, extractDocumentation, normalizeSlashes, parse, shortenFullJsonFilePath, TypeChainTarget } = require("typechain");

const { codegen } = require("./codegen");

const DEFAULT_OUT_PATH = "./types/web3-bignumber/";

exports.default = class Web3BigNumber extends TypeChainTarget {
  constructor(config) {
    super(config);
    this.name = "Web3-bignumber";
    const { cwd, outDir } = config;
    this.outDirAbs = resolve(cwd, outDir || DEFAULT_OUT_PATH);
  }

  transformFile(file) {
    const abi = extractAbi(file.contents);
    const isEmptyAbi = abi.length === 0;
    if (isEmptyAbi) {
      return;
    }

    const path = relative(this.cfg.inputDir, shortenFullJsonFilePath(file.path, this.cfg.allFiles));
    const documentation = extractDocumentation(file.contents);

    const contract = parse(abi, path, documentation);

    return {
      path: join(this.outDirAbs, ...contract.path, `${contract.name}.ts`),
      contents: codegen(contract),
    };
  }

  afterRun() {
    const { allFiles } = this.cfg;

    const barrels = createBarrelFiles(
      allFiles
        .map((p) => shortenFullJsonFilePath(p, allFiles))
        .map((p) => relative(this.cfg.inputDir, p))
        .map(normalizeSlashes),
      {
        typeOnly: true,
      }
    ).map((fd) => ({
      path: join(this.outDirAbs, fd.path),
      contents: fd.contents,
    }));

    return [
      {
        path: join(this.outDirAbs, "types.ts"),
        contents: `
import type BigNumber from "bignumber.js";
import type { EventEmitter } from "events";
import type { EventLog, PromiEvent, TransactionReceipt } from "web3-core/types";
import type { Contract } from "web3-eth-contract";

export interface EstimateGasOptions {
  from?: string;
  gas?: number;
  value?: number | string | BigNumber;
}

export interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type Callback<T> = (error: Error, result: T) => void;
export interface ContractEventLog<T> extends EventLog {
  returnValues: T;
}
export interface ContractEventEmitter<T> extends EventEmitter {
  on(event: "connected", listener: (subscriptionId: string) => void): this;
  on(event: "data" | "changed", listener: (event: ContractEventLog<T>) => void): this;
  on(event: "error", listener: (error: Error) => void): this;
}

export interface NonPayableTx {
  nonce?: string | number | BigNumber;
  chainId?: string | number | BigNumber;
  from?: string;
  to?: string;
  data?: string;
  gas?: string | number | BigNumber;
  maxPriorityFeePerGas?: string | number | BigNumber;
  maxFeePerGas?: string | number | BigNumber;
  gasPrice?: string | number | BigNumber;
}

export interface PayableTx extends NonPayableTx {
  value?: string | number | BigNumber;
}

export interface NonPayableTransactionObject<T> {
  arguments: any[];
  call(tx?: NonPayableTx, block?: BlockType): Promise<T>;
  send(tx?: NonPayableTx): PromiEvent<TransactionReceipt>;
  estimateGas(tx?: NonPayableTx): Promise<number>;
  encodeABI(): string;
}

export interface PayableTransactionObject<T> {
  arguments: any[];
  call(tx?: PayableTx, block?: BlockType): Promise<T>;
  send(tx?: PayableTx): PromiEvent<TransactionReceipt>;
  estimateGas(tx?: PayableTx): Promise<number>;
  encodeABI(): string;
}

export type BlockType = "latest" | "pending" | "genesis" | "earliest" | number | BigNumber;
export type BaseContract = Omit<Contract, "clone" | "once">;
        `,
      },
      ...barrels,
    ];
  }
};
