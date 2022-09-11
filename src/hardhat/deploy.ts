import BN from "bn.js";
import path from "path";
import { web3 } from "../network";
import { bn9, fmt18, fmt9 } from "../utils";
import { execSync } from "child_process";
import { AbiItem } from "web3-utils";
import { deployArtifact, hre } from "./index";
import prompts from "prompts";

export type DeployParams = {
  chainId: number;
  account: string;
  balance: string;
  contractName: string;
  args: string[];
  gasLimit: number;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  initialETH: string;
  uploadSources: boolean;
  useLegacyTxType: boolean;
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

  const { maxFeePerGas, maxPriorityFeePerGas } = await askFees();

  const useLegacyTxType = await askUseLegacy();

  await confirm({
    chainId: await web3().eth.getChainId(),
    account: deployer,
    balance: fmt18(await web3().eth.getBalance(deployer)),
    contractName,
    args: constructorArgs,
    gasLimit,
    maxPriorityFeePerGas: fmt9(maxPriorityFeePerGas) + " gwei",
    maxFeePerGas: fmt9(maxFeePerGas) + " gwei",
    initialETH: fmt18(initialETH),
    uploadSources,
    useLegacyTxType,
  });

  const backup = backupArtifacts(timestamp);

  const opts = useLegacyTxType
    ? { from: deployer, value: initialETH, gas: gasLimit, gasPrice: maxFeePerGas }
    : { from: deployer, value: initialETH, gas: gasLimit, maxFeePerGas, maxPriorityFeePerGas };
  const result = await deployArtifact(contractName, opts, constructorArgs, waitForConfirmations);
  const address = result.options.address;

  execSync(`mv ${backup} ${backup}/../${timestamp}-${address}`);

  console.log("constructor args abi-encoded:", abiEncodedConstructorArgs(result.options.jsonInterface, constructorArgs));

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

export async function askDeployer() {
  const { privateKey } = await prompts({
    type: "password",
    name: "privateKey",
    message: "burner deployer private key with some ETH",
  });

  const account = web3().eth.accounts.privateKeyToAccount(privateKey);
  web3().eth.accounts.wallet.add(account);

  return account.address as string;
}

export async function askFees() {
  const { maxPriorityFeePerGas, maxFeePerGas } = await prompts([
    {
      type: "number",
      name: "maxPriorityFeePerGas",
      message: "max priority fee (tip) in gwei",
      validate: (s: any) => !!parseInt(s),
    },
    {
      type: "number",
      name: "maxFeePerGas",
      message: "max total fees in gwei",
      validate: (s: any) => !!parseInt(s),
    },
  ]);
  return { maxPriorityFeePerGas: bn9(maxPriorityFeePerGas.toString()), maxFeePerGas: bn9(maxFeePerGas.toString()) };
}

async function askUseLegacy() {
  const { useLegacyTxType } = await prompts({
    type: "confirm",
    name: "useLegacyTxType",
    message: "Use legacy transaction type?",
    initial: false,
  });
  return !!useLegacyTxType;
}

async function confirm(params: DeployParams) {
  console.log("DEPLOYING!");
  console.log(params);
  const { ok } = await prompts({
    type: "confirm",
    name: "ok",
    message: "ALL OK?",
    initial: false,
  });
  if (!ok) throw new Error("aborted");
}
