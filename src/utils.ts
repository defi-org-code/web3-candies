import BN from "bignumber.js";
import Web3 from "web3";

export const zero = BN(0);
export const one = BN(1);
export const ten = BN(10);
export const ether = BN(1e18);
export const maxUint256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export const zeroAddress = "0x0000000000000000000000000000000000000000";

// Almost never return exponential notation:
BN.config({ EXPONENTIAL_AT: 1e9 });

export const nativeTokenAddresses = [
  zeroAddress,
  "0x0000000000000000000000000000000000001010",
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "0x000000000000000000000000000000000000dEaD",
  "0x000000000000000000000000000000000000800A",
];

export const isNativeAddress = (address: string) => !!nativeTokenAddresses.find((a) => eqIgnoreCase(a, address));

/**
 * @returns n value exponentiated integer: bne(123.456789, 3) ==> 123456
 */
export const bne = (n: BN.Value, exponent: number = 18) => bn(n).times(ten.pow(exponent)).integerValue(BN.ROUND_DOWN);
/**
 * @returns n value mantissa: bnm(123456.789, 3) ==> 123.456789
 */
export const bnm = (n: BN.Value, exponent: number = 18) => bn(n).div(ten.pow(exponent));

/**
 * @returns n exponentiated to 18 decimals
 */
export const bn18 = (n: BN.Value = 1) => bne(n, 18);

/**
 * @returns n exponentiated to 9 decimals
 */
export const bn9 = (n: BN.Value = 1) => bne(n, 9);

/**
 * @returns n exponentiated to 6 decimals
 */
export const bn6 = (n: BN.Value = 1) => bne(n, 6);

export function bn(n: BN.Value, base?: number): BN {
  if (n instanceof BN) return n;
  if (!n) return zero;
  return BN(n, base);
}

/**
 * @returns parsed BigNumber from formatted string. The opposite of `BigNumber.toFormat`
 */
export function parsebn(n: BN.Value, defaultValue?: BN, fmt?: BN.Format): BN {
  if (typeof n !== "string") return bn(n);

  const decimalSeparator = fmt?.decimalSeparator || ".";
  const str = n.replace(new RegExp(`[^${decimalSeparator}\\d-]+`, "g"), "");
  const result = bn(decimalSeparator === "." ? str : str.replace(decimalSeparator, "."));
  if (defaultValue && (!result.isFinite() || result.lte(zero))) return defaultValue;
  else return result;
}

/**
 * increase or decrease `n` decimal percision from `decimals` to `targetDecimals`
 */
export function convertDecimals(n: BN.Value, sourceDecimals: number, targetDecimals: number): BN {
  if (sourceDecimals === targetDecimals) return bn(n);
  else if (sourceDecimals > targetDecimals) return bn(n).idiv(ten.pow(sourceDecimals - targetDecimals));
  else return bn(n).times(ten.pow(targetDecimals - sourceDecimals));
}

export function eqIgnoreCase(a: string, b: string) {
  return a == b || a.toLowerCase() == b.toLowerCase();
}

export function median(arr: BN.Value[]): BN {
  if (!arr.length) return zero;

  arr = [...arr].sort((a, b) => bn(a).comparedTo(b));
  const midIndex = Math.floor(arr.length / 2);
  return arr.length % 2 !== 0
    ? bn(arr[midIndex])
    : bn(arr[midIndex - 1])
        .plus(arr[midIndex])
        .div(2);
}

export function getCreate2Address(from: string, salt: string, creationCodeHash: string): string {
  const u = Web3.utils;
  from = u.toChecksumAddress(from);
  if (u.hexToBytes(salt).length !== 32) throw new Error("salt must be 32 bytes " + salt);
  if (u.hexToBytes(creationCodeHash).length !== 32) throw new Error("creationCodeHash must be 32 bytes " + creationCodeHash);
  const hash = u.keccak256(u.encodePacked("0xff", from, salt, creationCodeHash)!);
  return u.toChecksumAddress(hash.slice(-40));
}
