import Web3 from "web3";
import BN from "bn.js";
import _ from "lodash";

export const zero = bn("0");
export const ether = bn18("1");
export const max = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export function bn(n: BN | string | number): BN {
  if (!n) return zero;
  else if (n instanceof BN) return n;
  else return new BN(n, 10);
}

/**
 * assuming 18 decimals, uncommafy (support "1,234.567")
 */
export function bn18(n: string | number): BN {
  return bn(Web3.utils.toWei(n.toString().split(",").join(""), "ether"));
}

/**
 * assuming 12 decimals, uncommafy (support "1,234.567")
 */
export function bn12(n: string | number): BN {
  return bn(Web3.utils.toWei(n.toString().split(",").join(""), "szabo"));
}

/**
 * assuming 9 decimals (gwei), uncommafy (support "1,234.567")
 */
export function bn9(n: string | number): BN {
  return bn(Web3.utils.toWei(n.toString().split(",").join(""), "gwei"));
}

/**
 * assuming 8 decimals, uncommafy (support "1,234.567")
 */
export function bn8(n: string | number): BN {
  return bn9(n).divn(10);
}

/**
 * assuming 6 decimals, uncommafy (support "1,234.567")
 */
export function bn6(n: string | number): BN {
  return bn(Web3.utils.toWei(n.toString().split(",").join(""), "lovelace"));
}

/**
 * formats from wei, assuming 18 decimals
 */
export function fmt18(ether: BN | number | string): string {
  return commafy(Web3.utils.fromWei(bn(ether), "ether"));
}

/**
 * formats from wei, assuming 12 decimals
 */
export function fmt12(ether: BN | number | string): string {
  return commafy(Web3.utils.fromWei(bn(ether), "szabo"));
}

/**
 * formats from wei, assuming 9 decimals
 */
export function fmt9(ether: BN | number | string): string {
  return commafy(Web3.utils.fromWei(bn(ether), "gwei"));
}

/**
 * formats from wei, assuming 8 decimals
 */
export function fmt8(n: BN | number | string): string {
  return fmt9(bn(n).muln(10));
}

/**
 * formats from wei, assuming 6 decimals
 */
export function fmt6(ether: BN | number | string): string {
  return commafy(Web3.utils.fromWei(bn(ether), "lovelace"));
}

/**
 * converts to 6 decimal number
 */
export function to6(n: BN | number | string, decimals: BN | number | string): BN {
  return convertDecimals(bn(n), bn(decimals), bn(6));
}

/**
 * converts to 8 decimal number
 */
export function to8(n: BN | number | string, decimals: BN | number | string): BN {
  return convertDecimals(bn(n), bn(decimals), bn(8));
}

/**
 * converts to 9 decimal number
 */
export function to9(n: BN | number | string, decimals: BN | number | string): BN {
  return convertDecimals(bn(n), bn(decimals), bn(9));
}

/**
 * converts to 12 decimal number
 */
export function to12(n: BN | number | string, decimals: BN | number | string): BN {
  return convertDecimals(bn(n), bn(decimals), bn(12));
}

/**
 * converts to 18 decimal number
 */
export function to18(n: BN | number | string, decimals: BN | number | string): BN {
  return convertDecimals(bn(n), bn(decimals), bn(18));
}

/**
 * increase or decrease `n` percision from `decimals` to `targetDecimals`
 */
export function convertDecimals(n: BN, decimals: BN, targetDecimals: BN) {
  return decimals.gt(targetDecimals)
    ? n.div(bn(10).pow(decimals.sub(targetDecimals)))
    : n.mul(bn(10).pow(targetDecimals.sub(decimals)));
}

export function commafy(num: string) {
  const parts = _.split(num, ".");
  const upper = _(parts[0].split(""))
    .reverse()
    .chunk(3)
    .map((c) => c.reverse().join(""))
    .reverse()
    .join(",");

  const lower = parts[1];
  if (lower) return `${upper}.${lower}`;
  else return upper;
}
