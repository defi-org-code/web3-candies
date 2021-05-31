import { Artifact } from "hardhat/types";
export declare const ethChainId = 1;
export declare const bscChainId = 56;
/**
 * the global hardhat runtime environment
 */
export declare function hre(): any;
/**
 * hardhat injected web3 instance
 */
export declare function web3(): any;
export declare function account(num?: number): Promise<string>;
export declare function artifact(name: string): Artifact;
export declare function tag(address: string, name: string): void;
export declare function impersonate(...address: string[]): Promise<void>;
export declare function resetNetworkFork(blockNumber?: number): Promise<void>;
export declare function mineBlocks(seconds: number, secondsPerBlock: number): Promise<void>;
export declare function mineBlock(seconds: number): Promise<void>;
export declare function getNetworkForkingBlockNumber(): any;
export declare function getNetworkForkingUrl(): any;
