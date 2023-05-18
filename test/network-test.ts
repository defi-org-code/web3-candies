import { expect } from "chai";
import Web3 from "web3";
import { account, bn, chainId, chainInfo, currentNetwork, estimateGasPrice, findBlock, hasWeb3Instance, networks, setWeb3Instance, web3, zero } from "../src";
import { artifact, expectRevert, resetNetworkFork, useChaiBigNumber } from "../src/hardhat";

useChaiBigNumber();

describe("network", () => {
  it("hardhat + web3", async () => {
    expect(require("hardhat").web3.utils.keccak256("foo")).eq(web3().utils.keccak256("foo"));

    await resetNetworkFork();

    expect(await account()).eq(await account(0));

    const startBalance = bn(await web3().eth.getBalance(await account()));
    expect(startBalance).bignumber.gt(zero);

    await web3().eth.sendTransaction({ from: await account(), to: await account(9), value: startBalance.div(2).toString() });

    await resetNetworkFork();

    expect(await web3().eth.getBalance(await account())).bignumber.eq(startBalance);

    expect(artifact("Example").sourceName).eq("contracts/Example.sol");
  });

  it("web3 global singleton", async () => {
    expect(hasWeb3Instance()).is.true;
    const prev = web3();
    expect(prev).not.undefined;
    setWeb3Instance(null);
    expect(hasWeb3Instance()).is.false;

    const instance = new Web3("");
    setWeb3Instance(instance);
    expect(web3()).eq(instance);
    expect(hasWeb3Instance()).is.true;
    setWeb3Instance(prev);
    expect(hasWeb3Instance()).is.true;
  });

  it("find block", async () => {
    const targetDate = new Date(2020, 5, 6);
    const result = await findBlock(targetDate.getTime());
    expect(result.timestamp).closeTo(targetDate.getTime() / 1000, 10_000);

    await expectRevert(() => findBlock(9999999999999), "in the future");
    await resetNetworkFork("latest");
    await findBlock(new Date(2022, 5, 6).setUTCHours(0));
  });

  it("currentNetwork", async () => {
    expect(process.env.NETWORK).eq("ETH");
    expect(await currentNetwork()).eq(networks.eth);

    process.env.NETWORK = "";
    expect(await currentNetwork()).to.be.undefined;

    const w = web3();
    w.eth.getChainId = () => Promise.resolve(1);
    setWeb3Instance(w);
    expect(await currentNetwork()).eq(networks.eth);

    process.env.NETWORK = "ETH";
  });

  it("chainId", async () => {
    expect(process.env.NETWORK).eq("ETH");
    expect(await chainId()).eq(0x1);
  });

  it("chain info", async () => {
    const eth = await chainInfo(1);
    expect(eth.chainId).eq(1);
    expect(eth.name).eq("Ethereum Mainnet");
    expect(eth.currency.decimals).eq(18);
    expect(eth.explorers[0].url).matches(/etherscan/);
    const ftm = await chainInfo(250);
    expect(ftm.logoUrl).not.empty;
  });

  it("gas price", async () => {
    await resetNetworkFork("latest");
    const prices = await estimateGasPrice();
    expect(prices.slow).bignumber.gt(1e6);
    expect(prices.avg).bignumber.gte(prices.slow);
    expect(prices.fast).bignumber.gte(prices.avg);
    expect(prices.blockNumber).gt(10000);
    expect(prices.baseFeePerGas).bignumber.lte(prices.slow);
  });
});
