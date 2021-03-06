import { expect } from "chai";
import * as _ from "lodash";
import { account, bn18, erc20, erc20s, networks, useChaiBN, zero, bn6, bn } from "../src";
import type { NonPayableTransactionObject } from "@typechain/web3-v1/static/types";
import { resetNetworkFork } from "../src/hardhat";

useChaiBN();

describe("erc20", () => {
  const token = erc20s.eth.WETH();

  it("erc20", async () => {
    const total = await token.methods.totalSupply().call();
    expect(total).bignumber.gt(zero);

    expect(token.name).eq("WETH");
    expect(token.address).eq(token.options.address).eq("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    expect(token.abi).deep.eq(token.options.jsonInterface);
  });

  it("well known erc20 tokens", async () => {
    expect(token.options.address).eq(erc20s.eth.WETH().options.address);
    expect(erc20s.eth.USDC().options.address).not.eq(erc20s.bsc.USDC().options.address);
    expect(await erc20s.eth.USDC().methods.decimals().call()).bignumber.eq("6");
    const a = await account();
    expect(await erc20s.eth.DAI().methods.allowance(a, a).call()).bignumber.zero;
    expect(await erc20s.eth.USDT().methods.allowance(a, a).call()).bignumber.zero;
    expect(await erc20s.eth.WBTC().methods.allowance(a, a).call()).bignumber.zero;

    expect(_.get(erc20s, [networks.eth.shortname, "USDC"])().options.address).eq(erc20s.eth.USDC().options.address);
  });

  describe("token helper methods", async () => {
    it("amount", async () => {
      expect(await token.methods.decimals().call()).bignumber.eq("18");
      expect(await token.amount(123)).bignumber.eq(bn18(123));
      expect(await token.amount(123.456789))
        .bignumber.eq(bn18("123.456789"))
        .eq("123456789000000000000");
      expect(await token.amount(bn(100_000_000))).bignumber.eq(bn18("100,000,000"));
    });

    it("mantissa - convert to 18 decimals", async () => {
      const token = erc20s.eth.USDC();
      expect(await token.methods.decimals().call()).bignumber.eq("6");
      expect(await token.mantissa(bn6(1234.123456)))
        .bignumber.eq(bn18(1234.123456))
        .eq("1234123456000000000000");
      expect(await token.mantissa(bn6(1234.123456))).bignumber.eq(bn18(1234.123456));
      expect(await token.mantissa(123456)).bignumber.eq(bn18(0.123456));
    });

    it("decimals - memoized and parsed", async () => {
      const token = erc20s.eth.USDC();
      expect(await token.decimals()).eq(6);

      token.methods.decimals = () => ({ call: () => Promise.resolve("0") } as NonPayableTransactionObject<string>); // proving the call is memoized
      expect(await token.methods.decimals().call()).bignumber.eq("0");
      expect(await token.decimals()).eq(6);

      expect(await token.amount(123)).bignumber.eq(bn6(123));
      expect(await token.mantissa(bn6(1234.123456))).bignumber.eq(bn18(1234.123456));
      await resetNetworkFork();
    });
  });
});
