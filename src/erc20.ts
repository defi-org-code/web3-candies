import type { ERC20, IWETH } from "./abi";
import { bne, bnm, convertDecimals, parsebn, BN } from "./utils";
import { Abi, Contract, contract } from "./contracts";
import { web3 } from "./network";

export const erc20abi = require("./abi/ERC20.json") as Abi;
export const iwethabi = require("./abi/IWETH.json") as Abi;

export type Token = ERC20 & {
  /**
   * human-readable name / symbol
   */
  name: string;
  /**
   * alias for token.options.address
   */
  address: string;
  /**
   * alias for token.options.jsonInterface
   */
  abi: Abi;
  /**
   * memoized version of methods.decimals
   */
  decimals: () => Promise<number>;
  /**
   * @param fmt formatted, significant digits, float, human-readable, ie 123.456
   * @returns amount in wei
   */
  amount: (fmt: BN.Value) => Promise<BN>;
  /**
   * @param amount in token amount
   * @returns mantissa with decimals
   */
  mantissa: (amount: BN.Value) => Promise<BN>;
  /**
   * @param amount in token amount
   * @returns amount in 18 decimals
   */
  to18: (amount: BN.Value) => Promise<BN>;
};

/**
 * to extend: `const myerc20s = _.merge(erc20s, { eth: ...})`
 */
export const erc20s = {
  eth: {
    WETH: () => erc20<IWETH>("WETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18, iwethabi),
    WBTC: () => erc20("WBTC", "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", 8),
    USDC: () => erc20("USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6),
    USDT: () => erc20("USDT", "0xdAC17F958D2ee523a2206206994597C13D831ec7", 6),
    DAI: () => erc20("DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18),
    LUSD: () => erc20("LUSD", "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0", 18),
    FRAX: () => erc20("FRAX", "0x853d955aCEf822Db058eb8505911ED77F175b99e", 18),
    ORBS: () => erc20("ORBS", "0xff56Cc6b1E6dEd347aA0B7676C85AB0B3D08B0FA", 18),
  },

  bsc: {
    WBNB: () => erc20<IWETH>("WBNB", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", 18, iwethabi),
    BTCB: () => erc20("BTCB", "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", 18),
    USDC: () => erc20("USDC", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", 18),
    USDT: () => erc20("USDT", "0x55d398326f99059fF775485246999027B3197955", 18),
    BUSD: () => erc20("BUSD", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", 18),
    WETH: () => erc20("WETH", "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", 18),
    DAI: () => erc20("DAI", "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", 18),
    FRAX: () => erc20("FRAX", "0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40", 18),
    CAKE: () => erc20("CAKE", "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", 18),
    ORBS: () => erc20("ORBS", "0xeBd49b26169e1b52c04cFd19FCf289405dF55F80", 18),
  },

  poly: {
    WMATIC: () => erc20<IWETH>("WMATIC", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", 18, iwethabi),
    sMATIC: () => erc20("sMATIC", "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4", 18),
    WBTC: () => erc20("WBTC", "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", 8),
    USDC: () => erc20("USDC", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", 6),
    USDT: () => erc20("USDT", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", 6),
    DAI: () => erc20("DAI", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", 18),
    WETH: () => erc20("WETH", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", 18),
    WBNB: () => erc20("WBNB", "0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3", 18),
    BUSD: () => erc20("BUSD", "0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7", 18),
    FRAX: () => erc20("FRAX", "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89", 18),
    ORBS: () => erc20("ORBS", "0x614389EaAE0A6821DC49062D56BDA3d9d45Fa2ff", 18),
  },

  arb: {
    WETH: () => erc20<IWETH>("WETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", 18, iwethabi),
  },

  avax: {
    WAVAX: () => erc20<IWETH>("WAVAX", "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", 18, iwethabi),
    USDC: () => erc20("USDC", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", 6),
    USDCe: () => erc20("USDC.e", "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", 6),
    USDT: () => erc20("USDT", "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", 6),
    USDTe: () => erc20("USDT.e", "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", 6),
    BUSDe: () => erc20("BUSD.e", "0x19860CCB0A68fd4213aB9D8266F7bBf05A8dDe98", 18),
    WBTCe: () => erc20("WBTC.e", "0x50b7545627a5162F82A992c33b87aDc75187B218", 8),
    WETHe: () => erc20("WETH.e", "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", 18),
    DAIe: () => erc20("DAI.e", "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", 18),
  },

  oeth: {
    WETH: () => erc20<IWETH>("WETH", "0x4200000000000000000000000000000000000006", 18, iwethabi),
    WBTC: () => erc20("WBTC", "0x68f180fcCe6836688e9084f035309E29Bf0A2095", 8),
    USDC: () => erc20("USDC", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", 6),
    USDT: () => erc20("USDT", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", 6),
    DAI: () => erc20("DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18),
  },

  ftm: {
    WFTM: () => erc20<IWETH>("WFTM", "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", 18, iwethabi),
    WBTC: () => erc20("WBTC", "0x321162Cd933E2Be498Cd2267a90534A804051b11", 8),
    WETH: () => erc20("WETH", "0x74b23882a30290451A17c44f4F05243b6b58C76d", 18),
    USDC: () => erc20("USDC", "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", 6),
    DAI: () => erc20("DAI", "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", 18),
    FRAX: () => erc20("FRAX", "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355", 18),
    ORBS: () => erc20("ORBS", "0x3E01B7E242D5AF8064cB9A8F9468aC0f8683617c", 18),
  },
};

export function erc20<T>(name: string, address: string, decimals?: number, extendAbi?: Abi): Token & T {
  const abi = extendAbi ? [...erc20abi, ...extendAbi] : erc20abi;
  address = web3().utils.toChecksumAddress(address);
  const result = contract<Token & T>(abi, address);
  wrapToken(result, name, address, decimals, abi);
  tryTag(address, name);
  return result;
}

export function wrapToken(token: Contract, name: string, address: string, decimals: number = 0, abi: Abi) {
  const t = token as Token;
  t.name = name;
  t.address = address;
  t.abi = abi;

  if (decimals) decimalsCache.set(address, decimals);

  t.decimals = () =>
    decimalsCache.has(address)
      ? Promise.resolve(decimalsCache.get(address)!)
      : t.methods
          .decimals()
          .call()
          .then(parseInt)
          .then((d) => {
            decimalsCache.set(address, d);
            return d;
          });

  t.amount = (fmt: BN.Value) => t.decimals().then((d: number) => bne(parsebn(fmt), d));

  t.mantissa = (amount: BN.Value) => t.decimals().then((d: number) => bnm(amount, d));

  t.to18 = (amount: BN.Value) => t.decimals().then((d: number) => convertDecimals(amount, d, 18));
}

const decimalsCache = new Map<string, number>();

function tryTag(address: string, name: string) {
  try {
    if (process.env.NODE) eval("require")("./hardhat").tag(address, name);
  } catch (ignore) {}
}
