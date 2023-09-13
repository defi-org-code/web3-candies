import BN from "bignumber.js";
import { execSync } from "child_process";
import path from "path";
import prompts from "prompts";
import { Abi } from "../contracts";
import { chainId, estimateGasPrice, network, web3 } from "../network";
import { bn9, bnm } from "../utils";
import { deployArtifact, hre } from "./index";
import fs from "fs-extra";
import _ from "lodash";

export type DeployParams = {
  contractName: string;
  args: any[];
  deployer?: string;
  maxFeePerGas?: BN;
  maxPriorityFeePerGas?: BN;
  uploadSources?: boolean;
  waitForConfirmations?: number;
};

export async function deploy(params: DeployParams): Promise<string> {
  if (!params.deployer) params.deployer = await askDeployer();

  if (!params.maxFeePerGas || !params.maxPriorityFeePerGas) {
    const fees = await askFees();
    params.maxFeePerGas = fees.max;
    params.maxPriorityFeePerGas = fees.tip;
  }
  const n = network(await chainId());

  await confirm({
    chainId: await web3().eth.getChainId(), // to explicitly state if hardhat
    network: n.name,
    balance: bnm(await web3().eth.getBalance(params.deployer)).toFormat() + " " + n.native.symbol,
    tip: bnm(params.maxPriorityFeePerGas, 9).toFormat(3) + " gwei",
    max: bnm(params.maxFeePerGas, 9).toFormat(3) + " gwei",
    ...params,
  });

  const backup = await backupArtifacts();

  const result = await deployArtifact(
    params.contractName,
    { from: params.deployer, maxFeePerGas: params.maxFeePerGas, maxPriorityFeePerGas: params.maxPriorityFeePerGas },
    params.args,
    params.waitForConfirmations
  );
  const address = result.options.address;
  console.log("🚀 DEPLOYED!", address);
  console.log("constructor args:", abiEncodedConstructorArgs(result.options.jsonInterface, params.args));
  await fs.rename(backup, `${backup}-${address}`);

  if (params.uploadSources) {
    await etherscanVerify(address, params.args);
  }

  console.log("done");
  return address;
}

export async function askAddress(message: string): Promise<string> {
  const { address } = await prompts({
    type: "text",
    name: "address",
    message,
    validate: (s: any) => web3().utils.isAddress(s),
  });
  if (!address) throw new Error("aborted");
  return address.toString();
}

export async function etherscanVerify(address: string, constructorArgs: any[]) {
  console.log("uploading sources to etherscan...");
  await hre().run("verify:verify", {
    address: address,
    constructorArguments: constructorArgs,
  });
}

export function abiEncodedConstructorArgs(abi: Abi, constructorArgs: any[]) {
  if (!constructorArgs.length) return "";
  const ctrAbi = abi.find((i) => i.type == "constructor");
  return web3().eth.abi.encodeFunctionCall(ctrAbi!, constructorArgs);
}

async function backupArtifacts() {
  const timestamp = Date.now();
  const dest = path.resolve(`./deployments/${timestamp}`);
  console.log("creating backup at", dest);
  execSync(`mkdir -p ${dest}`);
  execSync(`cp -r ./artifacts ${dest}`);
  const r = execSync(`find ${dest}/artifacts/build-info -type f`).toString().trim();
  const input = (await fs.readJson(r)).input;
  console.log("Contracts:");
  console.log(_.keys(input.sources));
  await fs.writeJson(`${dest}/solc.json`, input, { spaces: 2 });
  return dest;
}

export async function askDeployer() {
  const privateKey =
    process.env.DEPLOYER ||
    (
      await prompts({
        type: "password",
        name: "privateKey",
        message: "burner deployer private key with some gas",
      })
    ).privateKey;
  const account = web3().eth.accounts.privateKeyToAccount(privateKey);
  return web3().eth.accounts.wallet.add(account).address;
}

export async function askFees() {
  const price = await estimateGasPrice();
  const { selection } = await prompts({
    type: "select",
    choices: [
      { description: "fast", title: `${price.fast.tip.div(1e9).toFormat(3)} / ${price.fast.max.div(1e9).toFormat(3)} gwei`, value: price.fast },
      { description: "med", title: `${price.med.tip.div(1e9).toFormat(3)} / ${price.med.max.div(1e9).toFormat(3)} gwei`, value: price.med },
    ],
    name: "selection",
    message: "gas price",
  });
  if (!selection) throw new Error("aborted");
  return { max: BN(selection.max), tip: BN(selection.tip) };
}

async function confirm(params: any) {
  console.log("DEPLOYING!");
  console.log(params);
  const { ok } = await prompts({
    type: "confirm",
    name: "ok",
    message: "ALL OK?",
    initial: true,
  });
  if (!ok) throw new Error("aborted");
}
