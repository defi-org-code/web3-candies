import { HardhatUserConfig } from "hardhat/types";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-tracer";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-etherscan";
import { task } from "hardhat/config";
import { bn18, bscChainId, ethChainId } from "./src";

task("nothing").setAction(async () => {
  console.log("nothing");
});

export function configFile() {
  return require("./.config.json");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${configFile().alchemyKey}`,
      },
      blockGasLimit: 12e6,
      accounts: {
        accountsBalance: bn18("1,000,000").toString(),
      },
    },
    eth: {
      chainId: ethChainId,
      url: `https://eth-mainnet.alchemyapi.io/v2/${configFile().alchemyKey}`,
    },
    bsc: {
      chainId: bscChainId,
      url: "https://bsc-dataseed.binance.org",
    },
  },
  typechain: {
    outDir: "typechain-hardhat",
    target: "web3-v1",
  },
  mocha: {
    timeout: 500_000,
    retries: 1,
    bail: true,
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap: configFile().coinmarketcapKey,
    showTimeSpent: true,
  },
  etherscan: {
    apiKey: configFile().etherscanKey,
  },
};
export default config;
