import { ERC20 } from "../typechain-abi/ERC20";
import { IWETH } from "../typechain-abi/IWETH";
declare type Named = {
    name: string;
};
export declare const erc20s: {
    eth: {
        WETH: () => ERC20 & Named & IWETH;
        WBTC: () => ERC20 & Named;
        USDC: () => ERC20 & Named;
        USDT: () => ERC20 & Named;
        DAI: () => ERC20 & Named;
    };
    bsc: {
        WBNB: () => ERC20 & Named & IWETH;
        BTCB: () => ERC20 & Named;
        USDC: () => ERC20 & Named;
        USDT: () => ERC20 & Named;
        BUSD: () => ERC20 & Named;
    };
};
export declare function erc20<T>(name: string, address: string, extendAbi?: any[]): ERC20 & Named & T;
export {};
