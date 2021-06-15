import Web3 from "web3";
import { BlockInfo, BlockNumber } from "./contracts";
import type { Artifact } from "hardhat/types";
export declare const ethChainId = 1;
export declare const bscChainId = 56;
/**
 * hardhat injected web3 instance, or the global singleton
 */
export declare function web3(): Web3;
export declare function setWeb3Instance(web3: Web3): void;
export declare function account(num?: number): Promise<string>;
export declare function artifact(name: string): Artifact;
export declare function tag(address: string, name: string): void;
export declare function impersonate(...address: string[]): Promise<void>;
export declare function resetNetworkFork(blockNumber?: number): Promise<void>;
export declare function getNetworkForkingBlockNumber(): number;
export declare function getNetworkForkingUrl(): string;
export declare function block(blockHashOrBlockNumber?: BlockNumber | string): Promise<BlockInfo>;
export declare function estimatedBlockNumber(timestamp: number, avgBlockDurationSec: number): Promise<number>;
export declare function mineBlocks(seconds: number, secondsPerBlock: number): Promise<BlockInfo>;
export declare function mineBlock(seconds: number): Promise<BlockInfo>;
