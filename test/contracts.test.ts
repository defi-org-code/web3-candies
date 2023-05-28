import { expect } from "chai";
import { account, networks, contract, parseEvents, web3, zero, iwethabi, bn18, erc20sData, erc20s, currentNetwork, erc20, chainId } from "../src";
import { artifact, deployArtifact, expectRevert, mineBlocks, useChaiBigNumber } from "../src/hardhat";
import type { IWETH } from "../src/abi";
import type { Example } from "../typechain-hardhat/contracts/Example.sol";
import _ from "lodash";

useChaiBigNumber();

describe("Contracts", () => {
  const wToken = networks[process.env.NETWORK!.toLowerCase()].wToken.address;

  async function deployExample() {
    return await deployArtifact<Example>("Example", { from: await account() }, [123, wToken, [456]]);
  }

  describe("parseEvents", async () => {
    it("returns parsed events", async () => {
      const weth = contract<IWETH>(iwethabi, wToken);
      const tx = await weth.methods.deposit().send({ from: await account(), value: bn18(42) });
      const events = parseEvents(tx, iwethabi);
      if ((await chainId()) === 1) expect(events.find((e) => e.event === "Deposit")!.returnValues.wad).bignumber.eq(bn18("42")); // not all chains have this event
    });

    it("parses events of other contract abi", async () => {
      const c = await deployExample();
      const tx = await c.methods.testInnerEvent().send({ from: await account() });
      const events = parseEvents(tx, artifact("Example2").abi);
      expect(events.find((e) => e.event === "ExampleEvent")!.returnValues.foo).eq("bar");
    });
  });

  it("deploy wait for confirmations", async () => {
    const promise = deployArtifact("Example", { from: await account() }, [123, wToken, [456]], 3);

    await web3().eth.subscribe("pendingTransactions"); // must wait for deploy to actually be sent
    await mineBlocks(60, 1);
    web3().eth.clearSubscriptions(() => {});

    const result = await promise;
    expect(result.options.address).not.empty;
  });

  it("expectRevert, propagates errors correctly", async () => {
    const c = await deployExample();
    expect(await c.methods.assertNotZero("123").call()).bignumber.eq("123");
    await expectRevert(() => c.methods.assertNotZero(zero).call(), "n should not be zero");
  });
});
