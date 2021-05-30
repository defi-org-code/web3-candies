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
exports.getNetworkForkingUrl = exports.getNetworkForkingBlockNumber = exports.mineOneBlock = exports.mineBlocks = exports.resetNetworkFork = exports.impersonate = exports.tag = exports.artifact = exports.account = exports.web3 = exports.hre = void 0;
const lodash_1 = __importDefault(require("lodash"));
/**
 * the global hardhat runtime environment
 */
function hre() {
    return require("hardhat");
}
exports.hre = hre;
/**
 * hardhat injected web3 instance
 */
function web3() {
    return hre().web3;
}
exports.web3 = web3;
function account(num = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield web3().eth.getAccounts())[num];
    });
}
exports.account = account;
function artifact(name) {
    return hre().artifacts.readArtifactSync(name);
}
exports.artifact = artifact;
function tag(address, name) {
    if (hre().tracer)
        hre().tracer.nameTags[address] = name;
}
exports.tag = tag;
function impersonate(...address) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("impersonating", ...address);
        yield hre().network.provider.send("hardhat_impersonateAccount", [...address]);
    });
}
exports.impersonate = impersonate;
function resetNetworkFork(blockNumber = getNetworkForkingBlockNumber()) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("resetNetworkFork");
        yield hre().network.provider.send("hardhat_reset", [
            {
                forking: {
                    blockNumber,
                    jsonRpcUrl: getNetworkForkingUrl(),
                },
            },
        ]);
        console.log("now block", yield web3().eth.getBlockNumber());
    });
}
exports.resetNetworkFork = resetNetworkFork;
function mineBlocks(seconds, secondsPerBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`mining blocks in a loop and advancing time by ${seconds} seconds, ${secondsPerBlock} seconds per block`);
        const startBlock = yield web3().eth.getBlock("latest");
        for (let i = 0; i < Math.round(seconds / secondsPerBlock); i++) {
            yield hre().network.provider.send("evm_increaseTime", [secondsPerBlock]);
            yield hre().network.provider.send("evm_mine", [1 + startBlock.timestamp + secondsPerBlock * i]);
        }
        const nowBlock = yield web3().eth.getBlock("latest");
        console.log("was block", startBlock.number, startBlock.timestamp, "now block", nowBlock.number, nowBlock.timestamp);
    });
}
exports.mineBlocks = mineBlocks;
function mineOneBlock(seconds) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`mining 1 block and advancing time by ${seconds} seconds`);
        const startBlock = yield web3().eth.getBlock("latest");
        yield hre().network.provider.send("evm_increaseTime", [seconds]);
        yield hre().network.provider.send("evm_mine", [startBlock.timestamp + seconds]);
        const nowBlock = yield web3().eth.getBlock("latest");
        console.log("was block", startBlock.number, startBlock.timestamp, "now block", nowBlock.number, nowBlock.timestamp);
    });
}
exports.mineOneBlock = mineOneBlock;
function getNetworkForkingBlockNumber() {
    return lodash_1.default.get(hre().network.config, "forking.blockNumber");
}
exports.getNetworkForkingBlockNumber = getNetworkForkingBlockNumber;
function getNetworkForkingUrl() {
    return lodash_1.default.get(hre().network.config, "forking.url");
}
exports.getNetworkForkingUrl = getNetworkForkingUrl;
