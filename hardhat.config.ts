import _ from "lodash";
import "dotenv/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-tracer";
import "hardhat-gas-reporter";
import "hardhat-spdx-license-identifier";
import { task } from "hardhat/config";
import { account, erc20s, ether, web3 } from "./src";
import { deploy } from "./src/hardhat/deploy";
import { hardhatDefaultConfig } from "./src/hardhat";

task("deploy").setAction(async () => {
  const ac = web3().eth.accounts.create();
  console.log("pk:", ac.privateKey);
  await web3().eth.sendTransaction({ from: await account(), to: ac.address, value: ether });

  await deploy("Example", [123, erc20s.eth.WETH().address, [456]], 5_000_000, 0, true, 1);
});

export default _.merge(hardhatDefaultConfig(), {});
