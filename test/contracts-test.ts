import { expect } from "chai";
import {
  account,
  bn18,
  useChaiBN,
  deployArtifact,
  erc20,
  erc20s,
  ether,
  parseEvents,
  resetNetworkFork,
  web3,
  zero,
} from "../src";
import { Example } from "../typechain-hardhat/Example";

useChaiBN();

describe("Contracts", () => {
  const token = erc20("WETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

  it("erc20", async () => {
    const total = await token.methods.totalSupply().call();
    expect(total).bignumber.gt(zero);
  });

  it("erc20 has name", async () => {
    expect(token.name).eq("WETH");
  });

  it("well known erc20 tokens", async () => {
    expect(token.options.address).eq(erc20s.eth.WETH().options.address);
    expect(erc20s.eth.USDC().options.address).not.eq(erc20s.bsc.USDC().options.address);
    expect(await erc20s.eth.USDC().methods.decimals().call()).bignumber.eq("6");
    const a = await account();
    expect(await erc20s.eth.DAI().methods.allowance(a, a).call()).bignumber.zero;
    expect(await erc20s.eth.USDT().methods.allowance(a, a).call()).bignumber.zero;
    expect(await erc20s.eth.WBTC().methods.allowance(a, a).call()).bignumber.zero;
  });

  it("quick deploy compiled artifact", async () => {
    expect(await web3().eth.getBalance(await account())).bignumber.gt(ether);
    const deployed = await deployArtifact<Example>("Example", { from: await account() });
    expect(deployed.options.address).not.empty;
    expect(await deployed.methods.deployer().call()).eq(await account());
  });

  it("WETH and events", async () => {
    await resetNetworkFork();
    const tx = await erc20s.eth
      .WETH()
      .methods.deposit()
      .send({ from: await account(), value: bn18("42") });

    parseEvents(erc20s.eth.WETH(), tx); // needed only for other called contracts

    expect(tx.events!!.Deposit.returnValues.wad).bignumber.eq(bn18("42"));
    expect(
      await erc20s.eth
        .WETH()
        .methods.balanceOf(await account())
        .call()
    ).bignumber.eq(bn18("42"));
  });
});
