import { expect } from "chai";
import { account, block, bn, currentNetwork, estimatedBlockNumber, hasWeb3Instance, networks, setWeb3Instance, web3, zero } from "../src";
import { artifact, hre, resetNetworkFork, useChaiBigNumber } from "../src/hardhat";
import Web3 from "web3";

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

  it("estimated block number", async () => {
    const now = await block();
    expect(await estimatedBlockNumber(Date.now(), 10)).eq(now.number);
    expect(await estimatedBlockNumber(Date.now() - 10_000, 10)).eq(now.number - 1);
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
  });
});
