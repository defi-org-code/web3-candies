import { expect } from "chai";
import { account, networks, contract, parseEvents, web3, zero, iwethabi, bn18, chainId, Abi } from "../src";
import { artifact, deployArtifact, expectRevert, mineBlocks, useChaiBigNumber } from "../src/hardhat";
import type { IWETH } from "../src/abi";
import type { Example } from "../typechain-hardhat/contracts/Example.sol";
import _ from "lodash";
import sinon from "sinon";

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

  it("uses web3 instance from arguments if provided", async () => {});
});

describe("contract()", () => {
  const mockWeb3 = {
    eth: {
      Contract: sinon.stub().returns({
        foo: "bar",
      }),
    },
  };

  const abi: Abi = [];
  const address = "0x1234567890abcdef1234567890abcdef12345678";
  const options = {};

  it("should use the passed w3 argument", () => {
    contract(abi, address, options, mockWeb3);
    sinon.assert.calledOnce(mockWeb3.eth.Contract);
    sinon.assert.calledWith(mockWeb3.eth.Contract, abi, address, options);
  });

  it("should create a new Web3 instance if no w3 argument is passed", () => {
    const web3Stub = sinon.stub(require("../src/network"), "web3").returns({ eth: { Contract: sinon.stub().returns({}) } });
    contract(abi, address, options);
    sinon.assert.calledOnce(web3Stub);
    web3Stub.restore();
  });

  it("should return the contract instance", () => {
    const contractInstance = contract(abi, address, options, mockWeb3);
    expect(contractInstance).to.deep.equal({
      foo: "bar",
      handleRevert: false,
    });
  });
});
