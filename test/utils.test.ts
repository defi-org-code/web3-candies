import { expect } from "chai";
import { bn, bn18, bn6, bn9, eqIgnoreCase, ether, maxUint256, zero, zeroAddress, parsebn, one, ten, bne, bnm, convertDecimals, median, getCreate2Address, web3 } from "../src";
import { expectRevert, useChaiBigNumber } from "../src/hardhat";
import _ from "lodash";

useChaiBigNumber();

describe("utils", () => {
  it("equal ignore case", async () => {
    expect(eqIgnoreCase("", "")).is.true;
    expect(eqIgnoreCase("", "a")).is.false;
    expect(eqIgnoreCase("a", "")).is.false;
    expect(eqIgnoreCase("a", "b")).is.false;
    expect(eqIgnoreCase("a", "a")).is.true;
    expect(eqIgnoreCase("A", "a")).is.true;
    expect(eqIgnoreCase("a", "A")).is.true;
  });

  it("constants", async () => {
    expect(zero).bignumber.eq(bn(0)).eq(0);
    expect(one).bignumber.eq(1);
    expect(ten).bignumber.eq(10);
    expect(ether).bignumber.eq(bn18()).eq(1e18);
    expect(bn9()).bignumber.eq(1e9);
    expect(bn6()).bignumber.eq(1e6);
    expect(maxUint256).bignumber.eq(bn("2").pow(bn("256")).minus(1)); //max 256 bytes value
    expect(zeroAddress).eq("0x" + _.repeat("0", 40));

    expect(bn18(123)).bignumber.eq(123e18);
    expect(bn9(123.456)).bignumber.eq(123456000000);
    expect(bn6(123.456)).bignumber.eq(123456000);
  });

  it("bn", async () => {
    expect(bn(12345)).bignumber.closeTo(12340, 5);
    expect(bn(1).toString()).eq("1");
    expect(bn(1)).bignumber.eq(1);
    expect(bn(0)).bignumber.zero;
    expect(bn("")).bignumber.zero;
    expect(bn(`${maxUint256}${maxUint256}.${maxUint256}`)).bignumber.eq(`${maxUint256}${maxUint256}.${maxUint256}`);

    expect(bn("ff", 16)).bignumber.eq("255");
    expect(bn("0xff", 16)).bignumber.eq("255");
    expect(bn("10", 8)).bignumber.eq("8");
    expect(bn("hello").isNaN()).true;
  });

  it("bne, bnm", async () => {
    expect(bne(123.456, 4)).bignumber.eq(1234560);
    expect(bne(123.456789, 4)).bignumber.eq(1234567);
    expect(bnm(123456789.123, 4)).bignumber.eq(12345.6789123);
    expect(bnm(bn18(1000.1234)).toFormat()).eq("1,000.1234");
  });

  it("parsebn", async () => {
    expect(parsebn("")).bignumber.zero;
    expect(parsebn(0)).bignumber.zero;
    expect(parsebn("0.000")).bignumber.zero;
    expect(parsebn(1)).bignumber.eq(1);
    expect(parsebn(-1)).bignumber.eq(-1);
    expect(parsebn(bn18())).bignumber.eq(ether);
    expect(parsebn("1")).bignumber.eq(1);
    expect(parsebn("-1")).bignumber.eq(-1);
    expect(parsebn("1,234,567.123456789")).bignumber.eq(1234567.123456789);
    expect(parsebn("   001,234,567.1234567890000 \n\n")).bignumber.eq(1234567.123456789);
    expect(parsebn("1x234x567_123 456 789", undefined, { decimalSeparator: "_" })).bignumber.eq(1234567.123456789);
    expect(parsebn("asd", bn(1234))).bignumber.eq(1234);
    expect(parsebn("1.2.3", bn(1234))).bignumber.eq(1234);
    expect(parsebn("1.234567.123 456 789").isNaN()).true;
  });

  it("convertDecimals", async () => {
    expect(convertDecimals(123456, 3, 6)).bignumber.eq(bn6("123.456")).eq(123456000);
    expect(convertDecimals("123456", 3, 6)).bignumber.eq(bn6("123.456")).eq(123456000);
    expect(convertDecimals(bn("123456"), 3, 6)).bignumber.eq(123456000);
    expect(convertDecimals(123456789, 6, 3)).bignumber.eq(123456);
  });

  it("median", async () => {
    expect(median([123, 456789123, 456])).bignumber.eq(456);
  });

  it("compute CREATE2 address", async () => {
    const u = web3().utils;
    expect(u.stripHexPrefix("0x123456789")).eq("123456789");
    const hash = u.keccak256("Hello");
    expect(hash).eq(u.soliditySha3("Hello")).eq(u.sha3("Hello"));
    const bytes = u.hexToBytes(hash);
    expect(bytes.length).eq(32);
    expect(u.stripHexPrefix(hash).length).eq(32 * 2);
    expect(bytes.concat(bytes).length).eq(32 * 2);
    expect(bytes.length).eq(32);
    expect(u.bytesToHex(bytes)).eq(hash);

    const ff = u.hexToBytes("0xFF");
    expect(ff).deep.eq([255]);
    const sender = zeroAddress;
    const salt = u.keccak256("0x1234");
    expect(salt).eq("0x56570de287d73cd1cb6092bb8fdee6173974955fdef345ae579ee9f475ea7432");
    expect(u.encodePacked("0xff", "0xff")).eq("0xffff");
    expect(getCreate2Address(sender, salt, salt)).eq("0xe6dF1989733754C1052e84E256a9428179A945f8");
  });
});
