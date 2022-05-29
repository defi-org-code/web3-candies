import "dotenv/config";
import { HardhatUserConfig } from "hardhat/types";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-tracer";
import "hardhat-gas-reporter";
import "hardhat-spdx-license-identifier";
import { task } from "hardhat/config";
import { account, bn18, erc20s, ether, networks, web3 } from "./src";
import { deploy } from "./src/hardhat/deploy";

task("deploy").setAction(async () => {
  const ac = web3().eth.accounts.create();
  console.log("pk:", ac.privateKey);
  await web3().eth.sendTransaction({ from: await account(), to: ac.address, value: ether });

  await deploy("Example", [123, erc20s.eth.WETH().address, [456]], 5_000_000, 0, true, 1);
});

process.env.NETWORK = process.env.NETWORK?.toUpperCase() || "ETH";
console.log(`🌐 network`, process.env.NETWORK, "blocknumber", process.env.BLOCK_NUMBER, "🌐");

export default {
  solidity: {
    version: "0.8.10",
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
        blockNumber: process.env.BLOCK_NUMBER ? parseInt(process.env.BLOCK_NUMBER!) : undefined,
        url: (process.env as any)[`NETWORK_URL_${process.env.NETWORK}`] || "",
      },
      blockGasLimit: 10e6,
      accounts: {
        accountsBalance: bn18(10e6).toString(),
      },
    },
    eth: {
      chainId: networks.eth.id,
      url: process.env.NETWORK_URL_ETH || "",
    },
    bsc: {
      chainId: networks.bsc.id,
      url: process.env.NETWORK_URL_BSC || "",
    },
    poly: {
      chainId: networks.poly.id,
      url: process.env.NETWORK_URL_POLY || "",
    },
    avax: {
      chainId: networks.avax.id,
      url: process.env.NETWORK_URL_AVAX || "",
    },
  },
  typechain: {
    outDir: "typechain-hardhat",
    target: "web3-v1",
  },
  mocha: {
    timeout: 180_000,
    retries: 0,
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP,
    token: gasReporter().token,
    gasPriceApi: gasReporter().url,
    showTimeSpent: true,
  },
  etherscan: {
    apiKey: process.env[`ETHERSCAN_${process.env.NETWORK}`],
  },
} as HardhatUserConfig;

function gasReporter() {
  switch (process.env.NETWORK) {
    case "AVAX":
      return { token: "AVAX", url: "https://api.snowtrace.io/api?module=proxy&action=eth_gasPrice" };
    case "POLY":
      return { token: "MATIC", url: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice" };
    default:
      return {};
  }
}
