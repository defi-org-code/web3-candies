import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-web3";
import "@typechain/hardhat";
import "dotenv/config";
import "hardhat-gas-reporter";
import "hardhat-spdx-license-identifier";
import "hardhat-tracer";
import { task } from "hardhat/config";
import _ from "lodash";

import { account, erc20s, ether, web3 } from "./src";
import { hardhatDefaultConfig } from "./src/hardhat";
import { deploy } from "./src/hardhat/deploy";

task("deploy").setAction(async () => {
  const ac = web3().eth.accounts.create();
  console.log("pk:", ac.privateKey);
  await web3().eth.sendTransaction({ from: await account(), to: ac.address, value: ether.toString() });
  await deploy({
    contractName: "Example",
    args: [123, erc20s.eth.WETH().address, [456]],
  });
});

export default _.merge(hardhatDefaultConfig(), {
  mocha: {
    retries: 0,
  },
});
