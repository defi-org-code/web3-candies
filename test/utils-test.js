"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = require("../src/index");
const bn_js_1 = __importDefault(require("bn.js"));
const chai_bn_1 = __importDefault(require("chai-bn"));
before(() => {
    chai_1.use(chai_bn_1.default(bn_js_1.default));
});
describe("utils", () => {
    it("bn", async () => {
        chai_1.expect(index_1.bn(1).toString()).eq("1");
        chai_1.expect(index_1.bn(1)).bignumber.eq("1");
        chai_1.expect(index_1.bn18("1")).bignumber.eq("1000000000000000000");
        chai_1.expect(index_1.bn6("1").toString()).eq("1000000");
        chai_1.expect(index_1.bn6("1")).bignumber.eq("1000000");
        chai_1.expect(index_1.bn6("0.1")).bignumber.eq("100000");
        chai_1.expect(index_1.bn8("1").toString()).eq("100000000");
        chai_1.expect(index_1.bn8("1")).bignumber.eq(index_1.bn("100000000")).gt(index_1.bn6("1"));
        chai_1.expect(index_1.bn9("1").toString()).eq("1000000000");
        chai_1.expect(index_1.bn9("1")).bignumber.eq(index_1.bn("1000000000")).gt(index_1.bn6("1"));
    });
    it("uncommify before parsing", async () => {
        chai_1.expect(index_1.bn18("1,000,000.0")).bignumber.eq(index_1.bn18("1000000"));
        chai_1.expect(index_1.bn9("1,000,000.0")).bignumber.eq(index_1.bn9("1000000"));
        chai_1.expect(index_1.bn8("1,000,000.0")).bignumber.eq(index_1.bn8("1000000"));
        chai_1.expect(index_1.bn6("1,000,000.0")).bignumber.eq(index_1.bn6("1000000"));
    });
    it("format human readable", async () => {
        chai_1.expect(index_1.fmt6(index_1.bn6("1"))).eq("1");
        chai_1.expect(index_1.fmt8(index_1.bn8("1"))).eq("1");
        chai_1.expect(index_1.fmt9(index_1.bn9("1"))).eq("1");
        chai_1.expect(index_1.fmt18(index_1.bn18("1"))).eq("1");
        chai_1.expect(index_1.fmt18(index_1.bn18("1,234,567,890.123456789123456789"))).eq("1,234,567,890.123456789123456789");
        chai_1.expect(index_1.fmt9(index_1.bn9("1,234,567,890.123456789"))).eq("1,234,567,890.123456789");
        chai_1.expect(index_1.fmt8(index_1.bn8("1,234,567,890.12345678"))).eq("1,234,567,890.12345678");
        chai_1.expect(index_1.fmt6(index_1.bn6("1,234,567,890.123456"))).eq("1,234,567,890.123456");
    });
    it("constants", async () => {
        chai_1.expect(index_1.zero).bignumber.eq(index_1.bn(0)).eq("0");
        chai_1.expect(index_1.ether).bignumber.eq(index_1.bn18("1"));
        chai_1.expect(index_1.max).bignumber.eq(index_1.bn("2").pow(index_1.bn("256")).subn(1)); //max 256 bytes value
    });
});
