import { expect } from "chai";
import _ from "lodash";
import Web3 from "web3";
import {
  account,
  bn,
  bn18,
  chainId,
  erc20FromData,
  estimateGasPrice,
  findBlock,
  getPastEvents,
  hasWeb3Instance,
  iweth,
  maxUint256,
  network,
  networks,
  permit2Address,
  permit2Approve,
  permit2TransferFrom,
  recoverEIP712Signer,
  setWeb3Instance,
  signEIP712,
  web3,
  zero,
  zeroAddress,
} from "../src";
import { artifact, expectRevert, resetNetworkFork, tag, useChaiBigNumber } from "../src/hardhat";

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
    expect(hasWeb3Instance()).is.true; // hardhat web3

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
    expect(prices.slow.max).bignumber.gt(1);
    expect(prices.med.max).bignumber.gte(prices.slow.max);
    expect(prices.fast.max).bignumber.gte(prices.med.max);
    expect(prices.slow.tip).bignumber.lte(prices.slow.max);
    expect(prices.med.tip).bignumber.gte(prices.slow.tip);
    expect(prices.fast.tip).bignumber.gte(prices.med.tip);
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

    // slow
    xit("get past events", async () => {
      await resetNetworkFork("latest");
      const contract = iweth(await chainId());

      await contract.methods.deposit().send({ from: await account(), value: 1 });
      const result = await getPastEvents({ contract, eventName, filter: { [eventFilterKey]: await account() }, fromBlock: -10 });
      expect(result).length(1);
      expect(result[0].returnValues[eventFilterKey]).eq(await account());
    });

    // slow
    xit("get past events with lots of data", async () => {
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

  describe("sign and permit", () => {
    it("sign with EIP712", async () => {
      const typedData = {
        domain: {
          name: "Test",
          version: "1",
          chainId: await chainId(),
          verifyingContract: zeroAddress,
        },
        types: {
          Test: [
            { name: "value", type: "uint256" },
            { name: "account", type: "address" },
          ],
        },
        values: {
          value: 123456,
          account: await account(0),
        },
      };
      const signature = await signEIP712(await account(0), typedData);
      expect(signature).length(132);
      expect(recoverEIP712Signer(signature, typedData)).eq(await account(0));
    });

    it("permit2 approve for transfer", async () => {
      const token = network(await chainId()).wToken;
      const user1 = await account(1);
      const user2 = await account(2);
      const user3 = await account(3);

      await iweth(await chainId())
        .methods.deposit()
        .send({ from: user1, value: 1e18 });
      await erc20FromData(token).methods.approve(permit2Address, maxUint256).send({ from: user1 });

      await permit2Approve(token, user2).send({ from: user1 });
      await permit2TransferFrom(user1, user3, 1e18, token).send({ from: user2 });

      expect(await erc20FromData(token).methods.balanceOf(user3).call()).bignumber.eq(1e18);
    });
  });
});
