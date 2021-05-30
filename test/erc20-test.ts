import BN from "bn.js";
import CBN from "chai-bn";
import { expect, use } from "chai";
import { zero, erc20 } from "../src";

before(() => {
  use(CBN(BN));
});

describe("ERC20", () => {
  it("methods", async () => {
    const total = await erc20("USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48").methods.totalSupply().call();
    expect(total).bignumber.gt(zero);
  });
});
