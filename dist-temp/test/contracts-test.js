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
const bn_js_1 = __importDefault(require("bn.js"));
const chai_bn_1 = __importDefault(require("chai-bn"));
const chai_1 = require("chai");
const src_1 = require("../src");
before(() => {
    chai_1.use(chai_bn_1.default(bn_js_1.default));
});
describe("Contracts", () => {
    const token = src_1.erc20("WETH", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    it("erc20", () => __awaiter(void 0, void 0, void 0, function* () {
        const total = yield token.methods.totalSupply().call();
        chai_1.expect(total).bignumber.gt(src_1.zero);
    }));
    it("well known erc20 tokens", () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.expect(token.options.address).eq(src_1.Tokens.eth.WETH.options.address);
        chai_1.expect(src_1.Tokens.eth.USDC.options.address).not.eq(src_1.Tokens.bsc.USDC.options.address);
        chai_1.expect(yield src_1.Tokens.eth.USDC.methods.decimals().call()).bignumber.eq("6");
    }));
    it("quick deploy compiled artifact", () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.expect(yield src_1.web3().eth.getBalance(yield src_1.account())).bignumber.gt(src_1.ether);
        const deployed = yield src_1.deployArtifact("Example", { from: yield src_1.account() });
        chai_1.expect(deployed.options.address).not.empty;
        chai_1.expect(yield deployed.methods.deployer().call()).eq(yield src_1.account());
    }));
    it("WETH and events", () => __awaiter(void 0, void 0, void 0, function* () {
        yield src_1.resetNetworkFork();
        const tx = yield src_1.Tokens.eth.WETH.methods.deposit().send({ from: yield src_1.account(), value: src_1.bn18("42") });
        src_1.parseEvents(src_1.Tokens.eth.WETH, tx); // needed only for other called contracts
        chai_1.expect(tx.events.Deposit.returnValues.wad).bignumber.eq(src_1.bn18("42"));
        chai_1.expect(yield src_1.Tokens.eth.WETH.methods.balanceOf(yield src_1.account()).call()).bignumber.eq(src_1.bn18("42"));
    }));
});
