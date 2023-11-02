import BN from "bignumber.js";
import _ from "lodash";
import Web3 from "web3";
import type { ERC20, IWETH } from "./abi";
import { Abi, Contract, contract } from "./contracts";
import { bne, bnm, convertDecimals, parsebn } from "./utils";

export const erc20abi = require("./abi/ERC20.json") as Abi;
export const iwethabi = require("./abi/IWETH.json") as Abi;

export type TokenData = { symbol: string; address: string; decimals: number };

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

export const erc20sData = {
  eth: {
    WETH: {
      symbol: "WETH",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
      weth: true,
      logoUrl: "https://tokens-data.1inch.io/images/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    },
    WBTC: { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
    USDC: { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    USDT: { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    DAI: { symbol: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
    LUSD: { symbol: "LUSD", address: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0", decimals: 18 },
    FRAX: { symbol: "FRAX", address: "0x853d955aCEf822Db058eb8505911ED77F175b99e", decimals: 18 },
    ORBS: { symbol: "ORBS", address: "0xff56Cc6b1E6dEd347aA0B7676C85AB0B3D08B0FA", decimals: 18 },
  },
  bsc: {
    WBNB: {
      symbol: "WBNB",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
      weth: true,
      logoUrl: "https://tokens-data.1inch.io/images/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png",
    },
    BTCB: { symbol: "BTCB", address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", decimals: 18 },
    USDC: { symbol: "USDC", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
    USDT: { symbol: "USDT", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
    DAI: { symbol: "DAI", address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", decimals: 18 },
    BUSD: { symbol: "BUSD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals: 18 },
    WETH: { symbol: "WETH", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", decimals: 18 },
    ORBS: { symbol: "ORBS", address: "0xeBd49b26169e1b52c04cFd19FCf289405dF55F80", decimals: 18 },
  },
  poly: {
    WMATIC: {
      symbol: "WMATIC",
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      decimals: 18,
      weth: true,
      logoUrl: "https://tokens-data.1inch.io/images/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270.png",
    },
    sMATIC: { symbol: "sMATIC", address: "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4", decimals: 18 },
    WBTC: { symbol: "WBTC", address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", decimals: 8 },
    USDC: { symbol: "USDC", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6 },
    USDT: { symbol: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
    DAI: { symbol: "DAI", address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18 },
    WETH: { symbol: "WETH", address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", decimals: 18 },
    BUSD: { symbol: "BUSD", address: "0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7", decimals: 18 },
    ORBS: { symbol: "ORBS", address: "0x614389EaAE0A6821DC49062D56BDA3d9d45Fa2ff", decimals: 18 },
  },
  arb: {
    WETH: {
      symbol: "WETH",
      address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      decimals: 18,
      weth: true,
      logoUrl: "https://tokens-data.1inch.io/images/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    },
    WBTC: { symbol: "WBTC", address: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", decimals: 8 },
    USDC: { symbol: "USDC", address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", decimals: 6 },
    USDT: { symbol: "USDT", address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", decimals: 6 },
    DAI: { symbol: "DAI", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18 },
    ARB: { symbol: "ARB", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18 },
    FRAX: { symbol: "FRAX", address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F", decimals: 18 },
    TUSD: { symbol: "TUSD", address: "0x4D15a3A2286D883AF0AA1B3f21367843FAc63E07", decimals: 18 },
  },
  avax: {
    WAVAX: {
      symbol: "WAVAX",
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      decimals: 18,
      weth: true,
      logoUrl: "https://tokens-data.1inch.io/images/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7.png",
    },
    WBTCe: { symbol: "WBTC.e", address: "0x50b7545627a5162F82A992c33b87aDc75187B218", decimals: 8 },
    USDC: { symbol: "USDC", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
    USDCe: { symbol: "USDC.e", address: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", decimals: 6 },
    USDT: { symbol: "USDT", address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", decimals: 6 },
    USDTe: { symbol: "USDT.e", address: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", decimals: 6 },
    BUSDe: { symbol: "BUSD.e", address: "0x19860CCB0A68fd4213aB9D8266F7bBf05A8dDe98", decimals: 18 },
    WETHe: { symbol: "WETH.e", address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", decimals: 18 },
    DAIe: { symbol: "DAI.e", address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", decimals: 18 },
    ORBS: { symbol: "ORBS", address: "0x340fE1D898ECCAad394e2ba0fC1F93d27c7b717A", decimals: 18 },
  },
  ftm: {
    WFTM: {
      symbol: "WFTM",
      address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      decimals: 18,
      weth: true,
      logoUrl: "https://tokens-data.1inch.io/images/0x4e15361fd6b4bb609fa63c81a2be19d873717870.png",
    },
    WBTC: { symbol: "WBTC", address: "0x321162Cd933E2Be498Cd2267a90534A804051b11", decimals: 8 },
    WETH: { symbol: "WETH", address: "0x74b23882a30290451A17c44f4F05243b6b58C76d", decimals: 18 },
    USDC: { symbol: "USDC", address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", decimals: 6 },
    DAI: { symbol: "DAI", address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", decimals: 18 },
    FRAX: { symbol: "FRAX", address: "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355", decimals: 18 },
    ORBS: { symbol: "ORBS", address: "0x3E01B7E242D5AF8064cB9A8F9468aC0f8683617c", decimals: 18 },
  },
  oeth: {
    WETH: {
      symbol: "WETH",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      weth: true,
      logoUrl: "https://tokens-data.1inch.io/images/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    },
    WBTC: { symbol: "WBTC", address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", decimals: 8 },
    USDC: { symbol: "USDC", address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", decimals: 6 },
    USDT: { symbol: "USDT", address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6 },
    DAI: { symbol: "DAI", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18 },
    OP: { symbol: "OP", address: "0x4200000000000000000000000000000000000042", decimals: 18 },
    FRAX: { symbol: "FRAX", address: "0x2E3D870790dC77A83DD1d18184Acc7439A53f475", decimals: 18 },
  },
  glmr: {
    WGLMR: {
      symbol: "WGLMR",
      address: "0xAcc15dC74880C9944775448304B263D191c6077F",
      decimals: 18,
      weth: true,
      logoUrl: "https://moonscan.io/images/svg/brands/mainbrand-1.svg",
    },
    USDC: { symbol: "USDC", address: "0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9", decimals: 6 },
    WETH: { symbol: "WETH", address: "0x30D2a9F5FDf90ACe8c17952cbb4eE48a55D916A7", decimals: 18 },
  },
  base: {
    WETH: {
      symbol: "WETH",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      weth: true,
      logoUrl: "https://tokens-data.1inch.io/images/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    },
    USDC: { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
    DAI: { symbol: "DAI", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18 },
  },
};

/*
 *  erc20 instances of common base assets
 *  extend: `const myerc20s = _.merge(erc20s, { eth: ...})`
 */
export const erc20s: { [network: string]: { [symbol: string]: () => Token & IWETH } } = _.mapValues(erc20sData, (tokens) =>
  _.mapValues(tokens, (t: TokenData) => () => erc20<IWETH>(t.symbol, t.address, t.decimals, (t as any).weth ? iwethabi : undefined))
);

export function erc20FromData(token: TokenData) {
  return erc20(token.symbol, token.address, token.decimals);
}

export function iweth(chainId: number) {
  const wToken = require("./network").network(chainId).wToken;
  return erc20<IWETH>(wToken.symbol, wToken.address, wToken.decimals, iwethabi);
}

export function erc20<T>(name: string, address: string, decimals?: number, extendAbi?: Abi, w3?: Web3): Token & T {
  if (!w3) w3 = require("./network").web3();

  const abi = extendAbi ? [...erc20abi, ...extendAbi] : erc20abi;
  address = Web3.utils.toChecksumAddress(address);
  const result = contract<Token & T>(abi, address, undefined, w3);
  wrapToken(result, name, address, decimals, abi);
  tryTag(address, name);
  return result;
}

export async function fetchErc20(address: string): Promise<TokenData> {
  const e = erc20("", address);
  const [decimals, symbol] = await Promise.all([e.decimals(), e.methods.symbol().call()]);
  return { address: Web3.utils.toChecksumAddress(address), decimals, symbol };
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

export function tryTag(address: string, name: string) {
  try {
    if (process.env.NODE) eval("require")("./hardhat").tag(address, name);
  } catch (ignore) {}
}
