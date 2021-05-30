import BN from "bn.js";
import CBN from "chai-bn";
import { expect, use } from "chai";
import { account, bn18, deployArtifact, erc20, ether, parseEvents, resetNetworkFork, Tokens, web3, zero } from "../src";
import { Example } from "../typechain-hardhat/Example";

before(() => {
  use(CBN(BN));
});

describe("Contracts", () => {
  const token = erc20("WETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

  it("erc20", async () => {
    const total = await token.methods.totalSupply().call();
    expect(total).bignumber.gt(zero);
  });

  it("well known erc20 tokens", async () => {
    expect(token.options.address).eq(Tokens.eth.WETH.options.address);
    expect(Tokens.eth.USDC.options.address).not.eq(Tokens.bsc.USDC.options.address);
    expect(await Tokens.eth.USDC.methods.decimals().call()).bignumber.eq("6");
  });

  it("quick deploy compiled artifact", async () => {
    expect(await web3().eth.getBalance(await account())).bignumber.gt(ether);
    const deployed = await deployArtifact<Example>("Example", { from: await account() });
    expect(deployed.options.address).not.empty;
    expect(await deployed.methods.deployer().call()).eq(await account());
  });

  it("WETH and events", async () => {
    await resetNetworkFork();
    const tx = await Tokens.eth.WETH.methods.deposit().send({ from: await account(), value: bn18("42") });

    parseEvents(Tokens.eth.WETH, tx); // needed only for other called contracts

    expect(tx.events!!.Deposit.returnValues.wad).bignumber.eq(bn18("42"));
    expect(await Tokens.eth.WETH.methods.balanceOf(await account()).call()).bignumber.eq(bn18("42"));
  });
});
