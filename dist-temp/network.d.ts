import { Artifact, HardhatRuntimeEnvironment } from "hardhat/types";
import Web3 from "web3";
import { BlockInfo, BlockNumber } from "./contracts";
export declare const ethChainId = 1;
export declare const bscChainId = 56;
/**
 * the global hardhat runtime environment
 */
export declare function hre(): HardhatRuntimeEnvironment & {
    web3: Web3;
};
/**
 * hardhat injected web3 instance
 */
export declare function web3(): Web3;
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
