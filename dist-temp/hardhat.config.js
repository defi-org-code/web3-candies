"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configFile = void 0;
require("@typechain/hardhat");
require("hardhat-gas-reporter");
require("hardhat-tracer");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-etherscan");
const config_1 = require("hardhat/config");
const utils_1 = require("./src/utils");
const deploy_1 = require("./src/deploy");
config_1.task("deploy").setAction(() => __awaiter(void 0, void 0, void 0, function* () {
    yield deploy_1.deploy("Example", [], 5000000, 0, true);
}));
function configFile() {
    return require("./.config.json");
}
exports.configFile = configFile;
const alchemyUrl = `https://eth-mainnet.alchemyapi.io/v2/${configFile().alchemyKey}`;
const bscUrl = "https://bsc-dataseed.binance.org";
const config = {
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
                accountsBalance: utils_1.bn18("1,000,000").toString(),
            },
        },
        eth: {
            chainId: utils_1.ethChainId,
            url: alchemyUrl,
        },
        bsc: {
            chainId: utils_1.bscChainId,
            url: bscUrl,
        },
    },
    typechain: {
        outDir: "typechain-hardhat",
        target: "web3-v1",
    },
    mocha: {
        timeout: 500000,
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
exports.default = config;
