import { expect } from "chai";
import { account, bn18, contract, expectRevert, parseEvents, useChaiBN, web3, zero } from "../src";
import { deployArtifact, mineBlocks } from "../src/hardhat";
import type { Example } from "../typechain-hardhat/Example";
import type { IWETH } from "../typechain-abi/IWETH";
import { artifact } from "../dist/hardhat";
import _ from "lodash";

useChaiBN();

describe("Contracts", () => {
  const weth = contract<IWETH>(require("../abi/IWETH.json"), "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

  describe("parseEvents", async () => {
    it("mutates tx, returns parsed events", async () => {
      const tx = await weth.methods.deposit().send({ from: await account(), value: bn18("42") });
      const events = parseEvents(weth, tx); // needed only for other called contracts
      expect(events.Deposit.returnValues.wad).bignumber.eq(bn18("42"));
    });

    it("parses events of other contract abi", async () => {
      const c = await deployArtifact<Example>("Example", { from: await account() }, [123, weth.options.address, [456]]);
      const tx = await c.methods.testInnerEvent().send({ from: await account() });

      const events = parseEvents(artifact("Example2").abi, tx);

      expect(_.keys(events)).deep.eq(["ExampleEvent"]);
      expect(events.ExampleEvent.returnValues.foo).eq("bar");
    });
  });

  it("deploy wait for confirmations", async () => {
    const promise = deployArtifact("Example", { from: await account() }, [123, weth.options.address, [456]], 3);

    await web3().eth.subscribe("pendingTransactions"); // must wait for the deploy to actually be sent
    await mineBlocks(60, 1);
    web3().eth.clearSubscriptions(() => {});

    const result = await promise;
    expect(result.options.address).not.empty;
  });

  it("expectRevert", async () => {
    const c = await deployArtifact<Example>("Example", { from: await account() }, [123, weth.options.address, [456]]);
    expect(await c.methods.assertNotZero("123").call()).bignumber.eq("123");
    await expectRevert(() => c.methods.assertNotZero(zero).call(), "n should not be zero");
  });
});
