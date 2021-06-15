"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askAddress = exports.deploy = void 0;
const path_1 = __importDefault(require("path"));
const prompts_1 = __importDefault(require("prompts"));
const network_1 = require("./network");
const utils_1 = require("./utils");
const child_process_1 = require("child_process");
const contracts_1 = require("./contracts");
function deploy(contractName, constructorArgs, gasLimit, initialETH, uploadSources) {
    return __awaiter(this, void 0, void 0, function* () {
        const timestamp = new Date().getTime();
        const deployer = yield askDeployer();
        const gasPrice = yield askGasPrice();
        const params = {
            chainId: yield network_1.web3().eth.getChainId(),
            account: deployer,
            balance: utils_1.fmt18(yield network_1.web3().eth.getBalance(deployer)),
            contractName,
            args: constructorArgs,
            gasLimit,
            gasPrice: utils_1.fmt9(gasPrice),
            initialETH: utils_1.fmt18(initialETH),
            uploadSources,
        };
        yield confirm(params);
        const backup = backupArtifacts(timestamp);
        const result = yield contracts_1.deployArtifact(contractName, { from: deployer, gas: gasLimit, gasPrice: gasPrice.toString(), value: initialETH }, constructorArgs);
        const address = result.options.address;
        child_process_1.execSync(`mv ${backup} ${backup}/../${timestamp}-${address}`);
        if (uploadSources) {
            console.log("uploading sources to etherscan...");
            yield require("hardhat").run("verify:verify", {
                address: address,
                constructorArguments: constructorArgs,
            });
        }
        console.log("done");
    });
}
exports.deploy = deploy;
function askAddress(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const { address } = yield prompts_1.default({
            type: "text",
            name: "address",
            message,
            validate: (s) => network_1.web3().utils.isAddress(s),
        });
        if (!address)
            throw new Error("aborted");
        return address.toString();
    });
}
exports.askAddress = askAddress;
function backupArtifacts(timestamp) {
    const dest = path_1.default.resolve(`./deployments/${timestamp}`);
    console.log("creating backup at", dest);
    child_process_1.execSync(`mkdir -p ${dest}`);
    child_process_1.execSync(`cp -r ./artifacts ${dest}`);
    return dest;
}
function askDeployer() {
    return __awaiter(this, void 0, void 0, function* () {
        const { privateKey } = yield prompts_1.default({
            type: "password",
            name: "privateKey",
            message: "burner deployer private key with some ETH",
        });
        const account = network_1.web3().eth.accounts.privateKeyToAccount(privateKey);
        network_1.web3().eth.accounts.wallet.add(account);
        return account.address;
    });
}
function askGasPrice() {
    return __awaiter(this, void 0, void 0, function* () {
        const { gas } = yield prompts_1.default({
            type: "number",
            name: "gas",
            message: "gas price in gwei",
            validate: (s) => !!parseInt(s),
        });
        return utils_1.bn9(gas.toString());
    });
}
function confirm(params) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("DEPLOYING!");
        console.log(params);
        const { ok } = yield prompts_1.default({
            type: "confirm",
            name: "ok",
            message: "ALL OK?",
        });
        if (!ok)
            throw new Error("aborted");
    });
}
