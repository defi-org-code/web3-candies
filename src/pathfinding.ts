import _ from "lodash";
import { Token } from "./erc20";
import { BN, bn, zero } from "./utils";
import { web3 } from "./network";
import { Multicall } from "ethereum-multicall";

export type Path = { route: string[]; dstAmountOut: BN };

export type Pair = { token0: Token; token1: Token; reserve0: BN; reserve1: BN; pairAddress: string };

export class UniV2Pathfinder {
  async find(srcToken: Token, dstToken: Token, srcAmount: BN): Promise<Path> {
    let pairs = this.sortedPairs(...this.baseTokens(), srcToken, dstToken);
    pairs = await this.fetchReserves(pairs);
    return this.doFind(pairs, srcToken, srcAmount, dstToken);
  }

  baseTokens(): Token[] {
    throw new Error("Not implemented");
  }

  private async fetchReserves(pairs: Pair[]): Promise<Pair[]> {
    const mc = new Multicall({ web3Instance: web3(), tryAggregate: true });
    const calls = _.map(pairs, (p) => {
      return {
        reference: p.pairAddress,
        contractAddress: p.pairAddress,
        abi: [], //TODO
        calls: [
          {
            reference: p.pairAddress,
            methodName: "getReserves",
            methodParameters: [],
          },
        ],
      };
    });
    const results = await mc.call(calls);

    return _.map(pairs, (p) => {
      const res = _.find(results.results, (r) => r.callsReturnContext[0].reference === p.pairAddress);
      if (res && res.callsReturnContext[0].success) {
        const reserve0 = bn(res.callsReturnContext[0].returnValues[0].hex, 16);
        const reserve1 = bn(res.callsReturnContext[0].returnValues[1].hex, 16);
        return this.pair(p.token0, p.token1, reserve0, reserve1);
      } else {
        return p;
      }
    });
  }

  private pair(tokenA: Token, tokenB: Token, reserveA: BN = zero, reserveB: BN = zero): Pair {
    const [token0, token1, reserve0, reserve1] = tokenA.address < tokenB.address ? [tokenA, tokenB, reserveA, reserveB] : [tokenB, tokenA, reserveB, reserveA];
    return {
      pairAddress: "", //TODO
      token0,
      token1,
      reserve0,
      reserve1,
    };
  }

  private sortedPairs(...tokens: Token[]): Pair[] {
    return _.chain(tokens)
      .flatMap((t) => _.map(tokens, (tt) => [t, tt]))
      .filter((p) => p[0].address !== p[1].address)
      .map((p) => this.pair(p[0], p[1]))
      .uniqBy((p) => p.pairAddress)
      .value();
  }

  private async doFind(pairs: Pair[], srcToken: Token, srcAmount: BN, dstToken: Token): Promise<Path> {
    throw new Error("Not implemented");
    // const uPairs = await Promise.all(
    //   pairs.map(
    //     async (p) =>
    //       new uniswap.Pair(
    //         uniswap_core.CurrencyAmount.fromRawAmount(await uToken(p.token0), p.reserve0.toString()),
    //         uniswap_core.CurrencyAmount.fromRawAmount(await uToken(p.token1), p.reserve1.toString())
    //       )
    //   )
    // );
    // const result = uniswap.Trade.bestTradeExactIn(
    //   uPairs,
    //   uniswap_core.CurrencyAmount.fromRawAmount(await uToken(srcToken), srcAmount.toString()),
    //   await uToken(dstToken),
    //   {
    //     maxNumResults: 1,
    //     maxHops: 6,
    //   }
    // );
    // if (result.length >= 1) {
    //   return { route: _.map(result[0].route.path, (p) => p.address), dstAmountOut: bn(result[0].outputAmount.numerator.toString()) };
    // }
    // return { route: [], dstAmountOut: zero };
  }
}
