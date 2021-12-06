import { expect } from "chai";
import { account, bn18, erc20, erc20s, networks, useChaiBN, zero } from "../src";
import * as _ from "lodash";

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
    });
  });
});
