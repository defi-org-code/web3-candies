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
  iweth,
  signEIP712,
} from "../src";
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
    const targetDate = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const result = await findBlock(targetDate);
    expect(result.timestamp).closeTo(targetDate / 1000, 10_000);

    await expectRevert(() => findBlock(9999999999999), "in the future");
  });

  it("network", async () => {
    expect(network(1)).eq(networks.eth);
    expect(network(0)).to.be.undefined;
    expect(network(1).native.address).eq(zeroAddress);
  });

  it("chainId", async () => {
    expect(network(await chainId()).shortname).eq(process.env.NETWORK);
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

  describe("past events", () => {
    let eventName = "Deposit";
    let eventFilterKey = "dst";

    beforeEach(async () => {
      if ([networks.ftm, networks.arb].includes(network(await chainId()))) {
        eventName = "Transfer";
        eventFilterKey = "to";
      }
    });

    it("get past events", async () => {
      await resetNetworkFork("latest");
      const contract = iweth(await chainId());

      await contract.methods.deposit().send({ from: await account(), value: 1 });
      const result = await getPastEvents({ contract, eventName, filter: { [eventFilterKey]: await account() }, fromBlock: -10 });
      expect(result).length(1);
      expect(result[0].returnValues[eventFilterKey]).eq(await account());
    });

    it("get past events with lots of data", async () => {
      await resetNetworkFork("latest");
      const contract = iweth(await chainId());

      await contract.methods.deposit().send({ from: await account(), value: 1 });
      const result = await getPastEvents({ contract, eventName, filter: {}, fromBlock: -5_000 });
      expect(result.length).gt(1);
    });

    it("get past events with maxDistance", async () => {
      await resetNetworkFork("latest");
      const contract = iweth(await chainId());

      await contract.methods.deposit().send({ from: await account(), value: 1 });
      const result = await getPastEvents({ contract, eventName, filter: {}, fromBlock: -1000, maxDistanceBlocks: 100 });
      expect(result.length).gt(1);
    });
  });

  describe("sign", () => {
    it("sign with EIP712", async () => {
      const domain = {
        name: "Test",
        version: "1",
        chainId: await chainId(),
        verifyingContract: zeroAddress,
      };
      const types = {
        Test: [
          { name: "value", type: "uint256" },
          { name: "account", type: "address" },
        ],
      };
      const values = {
        value: 123456,
        account: await account(0),
      };
      const signature = await signEIP712(await account(0), { domain, types, values });
      expect(signature).length(132);
    });
  });
});
