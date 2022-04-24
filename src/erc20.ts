import BN from "bn.js";
import { bn, convertDecimals, decimals, to18 } from "./utils";
import { Abi, Contract, contract } from "./contracts";
import type { ERC20 } from "../typechain-abi/ERC20";
import type { IWETH } from "../typechain-abi/IWETH";
import type { PancakeswapLPAbi } from "../typechain-abi/PancakeswapLPAbi";
import type { AlpacaIBAlpacaAbi } from "../typechain-abi/AlpacaIBAlpacaAbi";
import type { AaveSAAVEAbi } from "../typechain-abi/AaveSAAVEAbi";
import type { CompoundCTokenAbi } from "../typechain-abi/CompoundCTokenAbi";
import type { VenusVBNBAbi } from "../typechain-abi/VenusVBNBAbi";
import type { VenusVTokenAbi } from "../typechain-abi/VenusVTokenAbi";

export type IERC20 = ERC20 & {
  /**
   * human readable name
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
   * @param mantissa significant digits in full shares (float)
   * @returns amount in wei
   */
  amount: (mantissa: number | BN) => Promise<BN>;
  /**
   * @param amount in token amount
   * @returns amount in 18 decimals
   */
  mantissa: (amount: number | string | BN) => Promise<BN>;
};
export type Token = IERC20;

/**
 * to extend: `const myerc20s = _.merge(erc20s, { eth: ...})`
 */
export const erc20s = {
  eth: {
    // ---- base assets ----
    WETH: () => erc20<IWETH>("WETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", require("../abi/IWETH.json")),
    WBTC: () => erc20("WBTC", "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"),
    USDC: () => erc20("USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
    USDT: () => erc20("USDT", "0xdAC17F958D2ee523a2206206994597C13D831ec7"),
    DAI: () => erc20("DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F"),

    // ---- bluechip ----
    ORBS: () => erc20("ORBS", "0xff56Cc6b1E6dEd347aA0B7676C85AB0B3D08B0FA"),

    // ---- 1inch ----
    OneInch: () => erc20("1INCH", "0x111111111117dC0aa78b770fA6A738034120C302"),

    // ---- aave ----
    AAVE: () => erc20("AAVE", "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"),
    Aave_stkAAVE: () => erc20<AaveSAAVEAbi>("Aave: stkAAVE", "0x4da27a545c0c5B758a6BA100e3a049001de870f5", require("../abi/AaveSAAVEAbi.json")),
    Aave_aUSDC: () => erc20("Aave: aUSDC", "0xBcca60bB61934080951369a648Fb03DF4F96263C"),

    // ---- compound ----
    COMP: () => erc20("COMP", "0xc00e94Cb662C3520282E6f5717214004A7f26888"),
    Compound_cUSDC: () => erc20<CompoundCTokenAbi>("Compound: cUSDC", "0x39AA39c021dfbaE8faC545936693aC917d5E7563", require("../abi/CompoundCTokenAbi.json")),
  },

  bsc: {
    // ---- base assets ----
    WBNB: () => erc20<IWETH>("WBNB", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", require("../abi/IWETH.json")),
    BTCB: () => erc20("BTCB", "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"),
    USDC: () => erc20("USDC", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"),
    USDT: () => erc20("USDT", "0x55d398326f99059fF775485246999027B3197955"),
    BUSD: () => erc20("BUSD", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"),

    // ---- bluechip ----
    ORBS: () => erc20("ORBS", "0xeBd49b26169e1b52c04cFd19FCf289405dF55F80"),
    DOT: () => erc20("DOT", "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402"),
    ADA: () => erc20("ADA", "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47"),
    LINK: () => erc20("LINK", "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD"),
    DOGE: () => erc20("DOGE", "0xbA2aE424d960c26247Dd6c32edC70B295c744C43"),

    // ---- pancakeswap ----
    CAKE: () => erc20("CAKE", "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"),
    Pancakeswap_LP_BUSD_BNB: () => erc20<PancakeswapLPAbi>("Pancakeswap: LP BUSD/BNB", "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16", require("../abi/PancakeswapLPAbi.json")),
    Pancakeswap_LP_BTCB_BNB: () => erc20<PancakeswapLPAbi>("Pancakeswap: LP BTCB/BNB", "0x61EB789d75A95CAa3fF50ed7E47b96c132fEc082", require("../abi/PancakeswapLPAbi.json")),
    Pancakeswap_LP_CAKE_BNB: () => erc20<PancakeswapLPAbi>("Pancakeswap: LP CAKE/BNB", "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0", require("../abi/PancakeswapLPAbi.json")),
    Pancakeswap_LP_ORBS_BUSD: () => erc20<PancakeswapLPAbi>("Pancakeswap: LP ORBS/BUSD", "0xB87b857670A44356f2b70337E0F218713D2378e8", require("../abi/PancakeswapLPAbi.json")),
    Pancakeswap_LP_DOT_BNB: () => erc20<PancakeswapLPAbi>("Pancakeswap: LP DOT/BNB", "0xDd5bAd8f8b360d76d12FdA230F8BAF42fe0022CF", require("../abi/PancakeswapLPAbi.json")),
    Pancakeswap_LP_ADA_BNB: () => erc20<PancakeswapLPAbi>("Pancakeswap: LP ADA/BNB", "0x28415ff2C35b65B9E5c7de82126b4015ab9d031F", require("../abi/PancakeswapLPAbi.json")),
    Pancakeswap_LP_LINK_BNB: () => erc20<PancakeswapLPAbi>("Pancakeswap: LP LINK/BNB", "0x824eb9faDFb377394430d2744fa7C42916DE3eCe", require("../abi/PancakeswapLPAbi.json")),
    Pancakeswap_LP_DOGE_BNB: () => erc20<PancakeswapLPAbi>("Pancakeswap: LP DOGE/BNB", "0xac109C8025F272414fd9e2faA805a583708A017f", require("../abi/PancakeswapLPAbi.json")),

    // ---- venus ----
    XVS: () => erc20("XVS", "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63"),
    Venus_vBNB: () => erc20<VenusVBNBAbi>("Venus: vBNB", "0xA07c5b74C9B40447a954e1466938b865b6BBea36", require("../abi/VenusVBNBAbi.json")),
    Venus_vBUSD: () => erc20<VenusVTokenAbi>("Venus: vBUSD", "0x95c78222B3D6e262426483D42CfA53685A67Ab9D", require("../abi/VenusVTokenAbi.json")),
    Venus_vUSDC: () => erc20<VenusVTokenAbi>("Venus: vUSDC", "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8", require("../abi/VenusVTokenAbi.json")),

    // ---- alpaca ----
    ALPACA: () => erc20("ALPACA", "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F"),
    Alpaca_ibALPACA: () => erc20<AlpacaIBAlpacaAbi>("Alpaca: ibALPACA", "0xf1bE8ecC990cBcb90e166b71E368299f0116d421", require("../abi/AlpacaIBAlpacaAbi.json")),
    Alpaca_ibETH: () => erc20<AlpacaIBAlpacaAbi>("Alpaca: ibETH", "0xbfF4a34A4644a113E8200D7F1D79b3555f723AfE", require("../abi/AlpacaIBAlpacaAbi.json")),
    Alpaca_ibBNB: () => erc20<AlpacaIBAlpacaAbi>("Alpaca: ibBNB", "0xd7D069493685A581d27824Fc46EdA46B7EfC0063", require("../abi/AlpacaIBAlpacaAbi.json")),
  },

  poly: {
    // ---- base assets ----
    WMATIC: () => erc20<IWETH>("WMATIC", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", require("../abi/IWETH.json")),
    WBTC: () => erc20("WBTC", "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"),
    USDC: () => erc20("USDC", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"),
    USDT: () => erc20("USDT", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"),
    DAI: () => erc20("DAI", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"),
    WETH: () => erc20("WETH", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"),
    WBNB: () => erc20("WBNB", "0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3"),
    BUSD: () => erc20("BUSD", "0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7"),

    // ---- bluechip ----
    ORBS: () => erc20("ORBS", "0x614389EaAE0A6821DC49062D56BDA3d9d45Fa2ff"),

    // ---- aave ----
    Aave_MATIC: () => erc20("Aave: aMATIC", "0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4"),
  },

  arb: {
    // ---- base assets ----
    WETH: () => erc20<IWETH>("WETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", require("../abi/IWETH.json")),
  },

  avax: {
    // ---- base assets ----
    WAVAX: () => erc20<IWETH>("WAVAX", "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", require("../abi/IWETH.json")),
    USDC: () => erc20("USDC", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"),
    USDCe: () => erc20("USDC.e", "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"),
    USDT: () => erc20("USDT", "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"),
    USDTe: () => erc20("USDT.e", "0xc7198437980c041c805A1EDcbA50c1Ce5db95118"),
    BUSDe: () => erc20("BUSD.e", "0x19860CCB0A68fd4213aB9D8266F7bBf05A8dDe98"),
    WBTCe: () => erc20("WBTC.e", "0x50b7545627a5162F82A992c33b87aDc75187B218"),
    WETHe: () => erc20("WETH.e", "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB"),
    DAIe: () => erc20("DAI.e", "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70"),

    // ---- bluechip ----
    AAVEe: () => erc20("AAVE.e", "0x63a72806098Bd3D9520cC43356dD78afe5D386D9"),
  },

  oeth: {
    // ---- base assets ----
    WETH: () => erc20<IWETH>("WETH", "0x4200000000000000000000000000000000000006", require("../abi/IWETH.json")),
    WBTC: () => erc20("WBTC", "0x68f180fcCe6836688e9084f035309E29Bf0A2095"),
    USDC: () => erc20("USDC", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607"),
    USDT: () => erc20("USDT", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"),
    DAI: () => erc20("DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"),
  },
};

export const erc20abi = require("../abi/ERC20.json") as Abi;

export function erc20<T>(name: string, address: string, extendAbi?: Abi): Token & T {
  const abi = extendAbi ? [...erc20abi, ...extendAbi] : erc20abi;
  const result = contract<Token & T>(abi, address);
  wrapToken(result, name, address, abi);
  tryTag(address, name);
  return result;
}

export function wrapToken(token: Contract, name: string, address: string, abi: Abi) {
  const t = token as Token;
  t.name = name;
  t.address = address;
  t.abi = abi;

  const tt = t as Token & { _decimals_memoized: number };

  t.decimals = () =>
    !!tt._decimals_memoized
      ? Promise.resolve(tt._decimals_memoized)
      : t.methods
          .decimals()
          .call()
          .then((d) => (tt._decimals_memoized = parseInt(d)));

  t.amount = (mantissa: number | BN) =>
    t.decimals().then((d: number) => {
      const mantissaDecimals = decimals(mantissa);
      return mantissa instanceof BN
        ? convertDecimals(bn(10).pow(bn(mantissaDecimals)).mul(mantissa), mantissaDecimals, d)
        : convertDecimals(bn(10).pow(bn(mantissaDecimals)).muln(mantissa), mantissaDecimals, d);
    });

  t.mantissa = (amount: number | string | BN) => t.decimals().then((d: number) => to18(amount, d));
}

function tryTag(address: string, name: string) {
  try {
    if (process.env.NODE) eval("require")("./hardhat").tag(address, name);
  } catch (ignore) {}
}
