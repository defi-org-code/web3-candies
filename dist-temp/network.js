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
exports.mineBlock = exports.mineBlocks = exports.estimatedBlockNumber = exports.block = exports.getNetworkForkingUrl = exports.getNetworkForkingBlockNumber = exports.resetNetworkFork = exports.impersonate = exports.tag = exports.artifact = exports.account = exports.web3 = exports.hre = exports.bscChainId = exports.ethChainId = void 0;
const lodash_1 = __importDefault(require("lodash"));
exports.ethChainId = 0x1;
exports.bscChainId = 0x38;
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
        console.log("resetNetworkFork to", blockNumber || "latest");
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
function getNetworkForkingBlockNumber() {
    return lodash_1.default.get(hre().network.config, "forking.blockNumber");
}
exports.getNetworkForkingBlockNumber = getNetworkForkingBlockNumber;
function getNetworkForkingUrl() {
    return lodash_1.default.get(hre().network.config, "forking.url");
}
exports.getNetworkForkingUrl = getNetworkForkingUrl;
function block(blockHashOrBlockNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const r = yield web3().eth.getBlock(blockHashOrBlockNumber || "latest");
        r.timestamp = typeof r.timestamp == "number" ? r.timestamp : parseInt(r.timestamp);
        return r;
    });
}
exports.block = block;
function estimatedBlockNumber(timestamp, avgBlockDurationSec) {
    return __awaiter(this, void 0, void 0, function* () {
        const current = yield web3().eth.getBlockNumber();
        const diffMillis = Date.now() - timestamp;
        const diffBlocks = Math.round(diffMillis / 1000 / avgBlockDurationSec);
        return current - diffBlocks;
    });
}
exports.estimatedBlockNumber = estimatedBlockNumber;
function mineBlocks(seconds, secondsPerBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`mining blocks in a loop and advancing time by ${seconds} seconds, ${secondsPerBlock} seconds per block`);
        const startBlock = yield block();
        const startTime = startBlock.timestamp + 1;
        for (let i = 0; i < Math.round(seconds / secondsPerBlock); i++) {
            yield hre().network.provider.send("evm_increaseTime", [secondsPerBlock]);
            yield hre().network.provider.send("evm_mine", [startTime + secondsPerBlock * i]);
        }
        const nowBlock = yield block();
        console.log("was: block", startBlock.number, "timestamp", startBlock.timestamp, "now: block", nowBlock.number, "timestamp", nowBlock.timestamp);
        return nowBlock;
    });
}
exports.mineBlocks = mineBlocks;
function mineBlock(seconds) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`mining 1 block and advancing time by ${seconds} seconds`);
        const startBlock = yield block();
        yield hre().network.provider.send("evm_increaseTime", [seconds]);
        yield hre().network.provider.send("evm_mine", [startBlock.timestamp + seconds]);
        const nowBlock = yield block();
        console.log("was: block", startBlock.number, "timestamp", startBlock.timestamp, "now: block", nowBlock.number, "timestamp", nowBlock.timestamp);
        return nowBlock;
    });
}
exports.mineBlock = mineBlock;
