import { HardhatUserConfig } from "hardhat/types";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-tracer";
import "hardhat-gas-reporter";
import { task } from "hardhat/config";
import { account, bn18, bscChainId, ethChainId, ether, web3 } from "./src";
import { deploy } from "./src/deploy";

task("deploy").setAction(async () => {
  const ac = web3().eth.accounts.create();
  console.log("pk:", ac.privateKey);
  await web3().eth.sendTransaction({ from: await account(), to: ac.address, value: ether });

  await deploy("Example", [], 5_000_000, 0, true, 1);
});

export function configFile() {
  return require("./.config.json");
}

const alchemyUrl = `https://eth-mainnet.alchemyapi.io/v2/${configFile().alchemyKey}`;
const bscUrl = "https://bsc-dataseed.binance.org";

export default {
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
        url: alchemyUrl,
      },
      blockGasLimit: 12e6,
      accounts: {
        accountsBalance: bn18("1,000,000").toString(),
      },
    },
    eth: {
      chainId: ethChainId,
      url: alchemyUrl,
    },
    bsc: {
      chainId: bscChainId,
      url: bscUrl,
    },
  },
  typechain: {
    outDir: "typechain-hardhat",
    target: "web3-v1",
  },
  mocha: {
    timeout: 500_000,
    retries: 0,
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap: configFile().coinmarketcapKey,
    showTimeSpent: true,
  },
  etherscan: {
    apiKey: configFile().etherscanKey,
  },
} as HardhatUserConfig;
