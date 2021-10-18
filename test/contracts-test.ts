import { expect } from "chai";
import { account, bn18, erc20, erc20s, expectRevert, parseEvents, useChaiBN, web3, zero, networks } from "../src";
import { deployArtifact, mineBlocks, resetNetworkFork } from "../src/hardhat";
import type { Example } from "../typechain-hardhat/Example";
import * as _ from "lodash";

useChaiBN();

describe("Contracts", () => {
  const token = erc20("WETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

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

  it("WETH and events", async () => {
    await resetNetworkFork();
    const tx = await erc20s.eth
      .WETH()
      .methods.deposit()
      .send({ from: await account(), value: bn18("42") });

    parseEvents(erc20s.eth.WETH(), tx); // needed only for other called contracts

    expect(tx.events!.Deposit.returnValues.wad).bignumber.eq(bn18("42"));
    expect(
      await erc20s.eth
        .WETH()
        .methods.balanceOf(await account())
        .call()
    ).bignumber.eq(bn18("42"));
  });

  it("deploy wait for confirmations", async () => {
    const promise = deployArtifact(
      "Example",
      { from: await account() },
      [123, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", [456]],
      3
    );

    await web3().eth.subscribe("pendingTransactions"); // must wait for the deploy to actually be sent
    await mineBlocks(60, 1);
    web3().eth.clearSubscriptions(() => {});

    const result = await promise;
    expect(result.options.address).not.empty;
  });

  it("expectRevert", async () => {
    const c = await deployArtifact<Example>("Example", { from: await account() }, [123, token.address, [456]]);
    expect(await c.methods.assertNotZero("123").call()).bignumber.eq("123");
    await expectRevert(() => c.methods.assertNotZero(zero).call(), "n should not be zero");
  });
});
