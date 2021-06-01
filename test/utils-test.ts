import { expect, use } from "chai";
import { bn, bn12, bn18, bn6, bn8, bn9, ether, expectRevert, fmt12, fmt18, fmt6, fmt8, fmt9, max, zero } from "../src";
import CBN from "chai-bn";
import BN from "bn.js";

describe("utils", () => {
  before(() => {
    use(CBN(BN));
  });

  it("bn", async () => {
    expect(bn(1).toString()).eq("1");
    expect(bn(1)).bignumber.eq("1");

    expect(bn18("1")).bignumber.eq(bn18(1)).eq("1000000000000000000");
    expect(bn12("1")).bignumber.eq(bn12(1)).eq("1000000000000");
    expect(bn6("1").toString()).eq(bn6(1).toString()).eq("1000000");
    expect(bn6("1")).bignumber.eq(bn6(1)).eq("1000000");
    expect(bn6("0.1")).bignumber.eq(bn6(0.1)).eq("100000");

    expect(bn8("1").toString()).eq(bn8(1).toString()).eq("100000000");
    expect(bn8("1")).bignumber.eq(bn8(1)).eq(bn("100000000")).gt(bn6("1"));

    expect(bn9("1").toString()).eq(bn9(1).toString()).eq("1000000000");
    expect(bn9("1")).bignumber.eq(bn9(1)).eq(bn("1000000000")).gt(bn6("1"));
  });

  it("uncommify before parsing", async () => {
    expect(bn18("1,000,000.0")).bignumber.eq(bn18("1000000"));
    expect(bn12("1,000,000.0")).bignumber.eq(bn12("1000000"));
    expect(bn9("1,000,000.0")).bignumber.eq(bn9("1000000"));
    expect(bn8("1,000,000.0")).bignumber.eq(bn8("1000000"));
    expect(bn6("1,000,000.0")).bignumber.eq(bn6("1000000"));
  });

  it("format human readable", async () => {
    expect(fmt6(bn6("1"))).eq("1");
    expect(fmt8(bn8("1"))).eq("1");
    expect(fmt9(bn9("1"))).eq("1");
    expect(fmt12(bn12("1"))).eq("1");
    expect(fmt18(bn18("1"))).eq("1");

    expect(fmt18(bn18("1,234,567,890.123456789123456789"))).eq("1,234,567,890.123456789123456789");
    expect(fmt12(bn12("1,234,567,890.123456789123"))).eq("1,234,567,890.123456789123");
    expect(fmt9(bn9("1,234,567,890.123456789"))).eq("1,234,567,890.123456789");
    expect(fmt8(bn8("1,234,567,890.12345678"))).eq("1,234,567,890.12345678");
    expect(fmt6(bn6("1,234,567,890.123456"))).eq("1,234,567,890.123456");
  });

  it("constants", async () => {
    expect(zero).bignumber.eq(bn(0)).eq("0");
    expect(ether).bignumber.eq(bn18("1"));
    expect(max).bignumber.eq(bn("2").pow(bn("256")).subn(1)); //max 256 bytes value
  });

  it("expectRevert", async () => {
    await expectRevert(() => {
      throw new Error("should catch this otherwise fails");
    });
  });
});
