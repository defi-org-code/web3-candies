import BN from "bn.js";
export declare const zero: BN;
export declare const ether: BN;
export declare const max = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export declare const ethChainId = 1;
export declare const bscChainId = 56;
export declare const secondsPerDay: number;
export declare const secondsPerYear: number;
export declare const millisPerMinute: number;
export declare const millisPerHour: number;
export declare const millisPerDay: number;
export declare function bn(n: BN | string | number): BN;
/**
 * assuming 18 decimals, uncommify (support "1,000")
 */
export declare function bn18(n: string): BN;
/**
 * assuming 9 decimals (gwei), uncommify (support "1,000")
 */
export declare function bn9(n: string): BN;
/**
 * assuming 8 decimals, uncommify (support "1,000")
 */
export declare function bn8(n: string): BN;
/**
 * assuming 6 decimals, uncommify (support "1,000")
 */
export declare function bn6(e: string): BN;
/**
 * formats from wei, assuming 18 decimals
 */
export declare function fmt18(ether: BN | number | string): string;
/**
 * formats from wei, assuming 9 decimals
 */
export declare function fmt9(ether: BN | number | string): string;
/**
 * formats from wei, assuming 8 decimals
 */
export declare function fmt8(n: BN | number | string): string;
/**
 * formats from wei, assuming 6 decimals
 */
export declare function fmt6(ether: BN | number | string): string;
