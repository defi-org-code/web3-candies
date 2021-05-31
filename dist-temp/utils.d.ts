import BN from "bn.js";
export declare const zero: BN;
export declare const ether: BN;
export declare const max = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export declare function bn(n: BN | string | number): BN;
/**
 * assuming 18 decimals, uncommafy (support "1,234.567")
 */
export declare function bn18(n: string | number): BN;
/**
 * assuming 12 decimals, uncommafy (support "1,234.567")
 */
export declare function bn12(n: string | number): BN;
/**
 * assuming 9 decimals (gwei), uncommafy (support "1,234.567")
 */
export declare function bn9(n: string | number): BN;
/**
 * assuming 8 decimals, uncommafy (support "1,234.567")
 */
export declare function bn8(n: string | number): BN;
/**
 * assuming 6 decimals, uncommafy (support "1,234.567")
 */
export declare function bn6(n: string | number): BN;
/**
 * formats from wei, assuming 18 decimals
 */
export declare function fmt18(ether: BN | number | string): string;
/**
 * formats from wei, assuming 12 decimals
 */
export declare function fmt12(ether: BN | number | string): string;
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
