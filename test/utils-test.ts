import { expect } from "chai";
import { bn, bn12, bn18, bn6, bn8, bn9, ether, fmt12, fmt18, fmt6, fmt8, fmt9, maxUint256, sqrt, to18, to3, to6, useChaiBN, zero } from "../src";

useChaiBN();

describe("utils", () => {
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
    expect(maxUint256).bignumber.eq(bn("2").pow(bn("256")).subn(1)); //max 256 bytes value
  });

  it("to3 decimals", async () => {
    expect(to3(100, 2)).bignumber.eq("1000");
    expect(to3("1000", "3")).bignumber.eq("1000");
    expect(to3(bn("1000"), bn("3"))).bignumber.eq("1000");
    expect(to3(bn18("1234"), 18)).bignumber.eq("1234000");
  });

  it("to6 decimals", async () => {
    expect(to6(100, 2)).bignumber.eq(bn6(1));
    expect(to6("1000", "3")).bignumber.eq(bn6(1));
    expect(to6(bn("1000"), bn("3"))).bignumber.eq(bn6(1));
    expect(to6(bn6("1"), 6)).bignumber.eq(bn6(1));
    expect(to6(bn9("1"), 9)).bignumber.eq(bn6(1));
  });

  it("to18 decimals", async () => {
    expect(to18(100, 2)).bignumber.eq(bn18(1));
    expect(to18("1000", "3")).bignumber.eq(bn18(1));
    expect(to18(bn("1000"), bn("3"))).bignumber.eq(bn18(1));
    expect(to18(bn6("1"), 6)).bignumber.eq(bn18(1));
    expect(to18(bn9("1"), 9)).bignumber.eq(bn18(1));
  });

  it("sqrt", async () => {
    expect(sqrt(zero)).bignumber.zero;
    expect(sqrt(bn(1))).bignumber.eq(bn(1));
    expect(sqrt(bn(2))).bignumber.eq(bn(1));
    expect(sqrt(bn(3))).bignumber.eq(bn(1));
    expect(sqrt(bn(4))).bignumber.eq(bn(2));
    expect(sqrt(bn(5))).bignumber.eq(bn(2));
    expect(sqrt(bn(9))).bignumber.eq(bn(3));
    expect(sqrt(bn(100))).bignumber.eq(bn(10));
    expect(sqrt(bn(123456789).sqr())).bignumber.eq(bn(123456789));
  });

  it("supports different bases", async () => {
    expect(bn("ff", 16)).bignumber.eq("255");
    expect(bn("0xff", 16)).bignumber.eq("255");
  });
});
