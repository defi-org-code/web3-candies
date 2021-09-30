import { expect } from "chai";
import { account, block, bn, estimatedBlockNumber, getNetwork, useChaiBN, web3, zero } from "../src";
import { artifact, resetNetworkFork } from "../src/hardhat";

useChaiBN();

describe("network", () => {
  it("hardhat + web3", async () => {
    expect(require("hardhat").web3.utils.keccak256("foo")).eq(web3().utils.keccak256("foo"));

    await resetNetworkFork();

    expect(await account()).eq(await account(0));

    const startBalance = bn(await web3().eth.getBalance(await account()));
    expect(startBalance).bignumber.gt(zero);

    await web3().eth.sendTransaction({ from: await account(), to: await account(9), value: startBalance.divn(2) });

    await resetNetworkFork();

    expect(await web3().eth.getBalance(await account())).bignumber.eq(startBalance);

    expect(artifact("Example").sourceName).eq("contracts/Example.sol");
  });

  it("estimated block number", async () => {
    const now = await block();
    expect(await estimatedBlockNumber(Date.now(), 10)).eq(now.number);
    expect(await estimatedBlockNumber(Date.now() - 10_000, 10)).eq(now.number - 1);
  });

  it("network", async () => {
    const network = await getNetwork();
    expect(network.id).eq(31337);
    expect(network.name).eq("unknown");
  });
});
