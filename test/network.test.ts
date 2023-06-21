import { expect } from "chai";
import Web3 from "web3";
import {
  account,
  bn,
  chainId,
  network,
  estimateGasPrice,
  findBlock,
  hasWeb3Instance,
  networks,
  setWeb3Instance,
  web3,
  zero,
  zeroAddress,
  erc20s,
  getPastEvents,
  block,
} from "../src";
import { artifact, expectRevert, resetNetworkFork, useChaiBigNumber } from "../src/hardhat";
import exp from "constants";

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

  it("network", async () => {
    expect(network(1)).eq(networks.eth);
    expect(network(0)).to.be.undefined;
    expect(network(1).native.address).eq(zeroAddress);
  });

  it("chainId", async () => {
    expect(process.env.NETWORK).eq("eth");
    expect(await chainId()).eq(0x1);
  });

  it("gas price", async () => {
    await resetNetworkFork("latest");
    const prices = await estimateGasPrice();
    console.log(JSON.stringify(prices, null, 2));
    expect(prices.slow.max).bignumber.gt(1e6);
    expect(prices.med.max).bignumber.gte(prices.slow.max);
    expect(prices.fast.max).bignumber.gte(prices.med.max);
    expect(prices.slow.tip).bignumber.lte(prices.slow.max);
    expect(prices.med.tip).bignumber.gte(prices.slow.tip).lte(prices.slow.max);
    expect(prices.fast.tip).bignumber.gte(prices.med.tip).lte(prices.fast.max);
  });

  it("get past events", async () => {
    await resetNetworkFork("latest");
    const contract = erc20s.eth.WETH();

    await contract.methods.deposit().send({ from: await account(), value: 1 });
    const result = await getPastEvents({ contract, eventName: "Deposit", filter: { dst: await account() }, fromBlock: -10 });
    expect(result).length(1);
    expect(result[0].returnValues[0]).eq(await account());
  });

  it("get past events with lots of data", async () => {
    await resetNetworkFork("latest");
    const contract = erc20s.eth.WETH();

    await contract.methods.deposit().send({ from: await account(), value: 1 });
    const result = await getPastEvents({ contract, eventName: "Deposit", filter: {}, fromBlock: -10_000 });
    expect(result.length).gt(1);
  });
});
