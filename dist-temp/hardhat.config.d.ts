import { HardhatUserConfig } from "hardhat/types";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-tracer";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-etherscan";
export declare function configFile(): any;
declare const config: HardhatUserConfig;
export default config;
