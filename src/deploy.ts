import BN from "bn.js";
import path from "path";
import { web3 } from "./network";
import { bn9, fmt18, fmt9 } from "./utils";
import { execSync } from "child_process";
import { deployArtifact } from "./contracts";
import { AbiItem } from "web3-utils";
import { hre } from "./hardhat";
import prompts from "prompts";

export type DeployParams = {
  chainId: number;
  account: string;
  balance: string;
  contractName: string;
  args: string[];
  gasLimit: number;
  gasPrice: string;
  initialETH: string;
  uploadSources: boolean;
};

export async function deploy(
  contractName: string,
  constructorArgs: any[],
  gasLimit: number,
  initialETH: BN | string | number,
  uploadSources: boolean,
  waitForConfirmations: number
): Promise<string> {
  const timestamp = new Date().getTime();
  const deployer = await askDeployer();
  const gasPrice = await askGasPrice();

  const params: DeployParams = {
    chainId: await web3().eth.getChainId(),
    account: deployer,
    balance: fmt18(await web3().eth.getBalance(deployer)),
    contractName,
    args: constructorArgs,
    gasLimit,
    gasPrice: fmt9(gasPrice),
    initialETH: fmt18(initialETH),
    uploadSources,
  };

  await confirm(params);

  const backup = backupArtifacts(timestamp);

  const result = await deployArtifact(
    contractName,
    { from: deployer, gas: gasLimit, gasPrice: gasPrice.toString(), value: initialETH },
    constructorArgs,
    waitForConfirmations
  );
  const address = result.options.address;

  execSync(`mv ${backup} ${backup}/../${timestamp}-${address}`);

  console.log(
    "constructor args abi-encoded:",
    abiEncodedConstructorArgs(result.options.jsonInterface, constructorArgs)
  );

  if (uploadSources) {
    await etherscanVerify(address, constructorArgs);
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

export function abiEncodedConstructorArgs(abi: AbiItem[], constructorArgs: any[]) {
  if (!constructorArgs.length) return "";
  const ctrAbi = abi.find((i) => i.type == "constructor");
  return web3().eth.abi.encodeFunctionCall(ctrAbi!, constructorArgs);
}

function backupArtifacts(timestamp: number) {
  const dest = path.resolve(`./deployments/${timestamp}`);
  console.log("creating backup at", dest);
  execSync(`mkdir -p ${dest}`);
  execSync(`cp -r ./artifacts ${dest}`);
  return dest;
}

async function askDeployer() {
  const { privateKey } = await prompts({
    type: "password",
    name: "privateKey",
    message: "burner deployer private key with some ETH",
  });

  const account = web3().eth.accounts.privateKeyToAccount(privateKey);
  web3().eth.accounts.wallet.add(account);

  return account.address as string;
}

async function askGasPrice() {
  const { gas } = await prompts({
    type: "number",
    name: "gas",
    message: "gas price in gwei",
    validate: (s: any) => !!parseInt(s),
  });
  return bn9(gas.toString());
}

async function confirm(params: DeployParams) {
  console.log("DEPLOYING!");
  console.log(params);
  const { ok } = await prompts({
    type: "confirm",
    name: "ok",
    message: "ALL OK?",
  });
  if (!ok) throw new Error("aborted");
}
