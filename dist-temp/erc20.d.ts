import { ERC20 } from "../typechain-abi/ERC20";
import { IWETH } from "../typechain-abi/IWETH";
export declare const Tokens: {
    eth: {
        WETH: () => ERC20 & IWETH;
        WBTC: () => ERC20;
        USDC: () => ERC20;
        USDT: () => ERC20;
        DAI: () => ERC20;
    };
    bsc: {
        WBNB: () => ERC20 & IWETH;
        BTCB: () => ERC20;
        USDC: () => ERC20;
        USDT: () => ERC20;
        BUSD: () => ERC20;
    };
};
export declare function erc20<T>(name: string, address: string, extendAbi?: any[]): ERC20 & T;
