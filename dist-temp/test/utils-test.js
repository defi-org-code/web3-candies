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
const chai_1 = require("chai");
const src_1 = require("../src");
const bn_js_1 = __importDefault(require("bn.js"));
const chai_bn_1 = __importDefault(require("chai-bn"));
before(() => {
    chai_1.use(chai_bn_1.default(bn_js_1.default));
});
describe("utils", () => {
    it("bn", () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.expect(src_1.bn(1).toString()).eq("1");
        chai_1.expect(src_1.bn(1)).bignumber.eq("1");
        chai_1.expect(src_1.bn18("1")).bignumber.eq("1000000000000000000");
        chai_1.expect(src_1.bn12("1")).bignumber.eq("1000000000000");
        chai_1.expect(src_1.bn6("1").toString()).eq("1000000");
        chai_1.expect(src_1.bn6("1")).bignumber.eq("1000000");
        chai_1.expect(src_1.bn6("0.1")).bignumber.eq("100000");
        chai_1.expect(src_1.bn8("1").toString()).eq("100000000");
        chai_1.expect(src_1.bn8("1")).bignumber.eq(src_1.bn("100000000")).gt(src_1.bn6("1"));
        chai_1.expect(src_1.bn9("1").toString()).eq("1000000000");
        chai_1.expect(src_1.bn9("1")).bignumber.eq(src_1.bn("1000000000")).gt(src_1.bn6("1"));
    }));
    it("uncommify before parsing", () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.expect(src_1.bn18("1,000,000.0")).bignumber.eq(src_1.bn18("1000000"));
        chai_1.expect(src_1.bn12("1,000,000.0")).bignumber.eq(src_1.bn12("1000000"));
        chai_1.expect(src_1.bn9("1,000,000.0")).bignumber.eq(src_1.bn9("1000000"));
        chai_1.expect(src_1.bn8("1,000,000.0")).bignumber.eq(src_1.bn8("1000000"));
        chai_1.expect(src_1.bn6("1,000,000.0")).bignumber.eq(src_1.bn6("1000000"));
    }));
    it("format human readable", () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.expect(src_1.fmt6(src_1.bn6("1"))).eq("1");
        chai_1.expect(src_1.fmt8(src_1.bn8("1"))).eq("1");
        chai_1.expect(src_1.fmt9(src_1.bn9("1"))).eq("1");
        chai_1.expect(src_1.fmt12(src_1.bn12("1"))).eq("1");
        chai_1.expect(src_1.fmt18(src_1.bn18("1"))).eq("1");
        chai_1.expect(src_1.fmt18(src_1.bn18("1,234,567,890.123456789123456789"))).eq("1,234,567,890.123456789123456789");
        chai_1.expect(src_1.fmt12(src_1.bn12("1,234,567,890.123456789123"))).eq("1,234,567,890.123456789123");
        chai_1.expect(src_1.fmt9(src_1.bn9("1,234,567,890.123456789"))).eq("1,234,567,890.123456789");
        chai_1.expect(src_1.fmt8(src_1.bn8("1,234,567,890.12345678"))).eq("1,234,567,890.12345678");
        chai_1.expect(src_1.fmt6(src_1.bn6("1,234,567,890.123456"))).eq("1,234,567,890.123456");
    }));
    it("constants", () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.expect(src_1.zero).bignumber.eq(src_1.bn(0)).eq("0");
        chai_1.expect(src_1.ether).bignumber.eq(src_1.bn18("1"));
        chai_1.expect(src_1.max).bignumber.eq(src_1.bn("2").pow(src_1.bn("256")).subn(1)); //max 256 bytes value
    }));
    it("expectRevert", () => __awaiter(void 0, void 0, void 0, function* () {
        yield src_1.expectRevert(() => {
            throw new Error("should catch this otherwise fails");
        });
    }));
});
