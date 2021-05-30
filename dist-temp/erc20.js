"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.erc20 = exports.Tokens = void 0;
const contracts_1 = require("./contracts");
const network_1 = require("./network");
const erc20abi = require("../abi/ERC20.json");
const wethabi = require("../abi/IWETH.json");
exports.Tokens = {
    eth: {
        WETH: () => erc20("$WETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", wethabi),
        WBTC: () => erc20("$WBTC", "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"),
        USDC: () => erc20("$USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
        USDT: () => erc20("$USDT", "0xdAC17F958D2ee523a2206206994597C13D831ec7"),
        DAI: () => erc20("$DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F"),
    },
    bsc: {
        WBNB: () => erc20("$WBNB", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", wethabi),
        BTCB: () => erc20("$BTCB", "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"),
        USDC: () => erc20("$USDC", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"),
        USDT: () => erc20("$USDT", "0x55d398326f99059fF775485246999027B3197955"),
        BUSD: () => erc20("$BUSD", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"),
    },
};
function erc20(name, address, extendAbi) {
    const abi = extendAbi ? [...erc20abi, ...extendAbi] : erc20abi;
    const result = contracts_1.contract(abi, address);
    network_1.tag(address, name);
    return result;
}
exports.erc20 = erc20;