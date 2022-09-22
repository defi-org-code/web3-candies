import { expect } from "chai";
import { erc1155, erc721, zero, zeroAddress } from "../src";

describe("nfts", () => {
  it("erc721", async () => {
    const token = erc721("CryptoKitties", "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d");
    expect(await token.methods.totalSupply().call()).bignumber.gt(zero);

    expect(token.name).eq("CryptoKitties");
    expect(token.address).eq(token.options.address).eq("0x06012c8cf97BEaD5deAe237070F9587f8E7A266d");
    expect(token.abi).deep.eq(token.options.jsonInterface);
  });

  it("erc1155", async () => {
    const token = erc1155("OpenSea Storefront", "0x495f947276749Ce646f68AC8c248420045cb7b5e");
    expect(await token.methods.balanceOf(zeroAddress, 0).call()).bignumber.eq(zero);

    expect(token.name).eq("OpenSea Storefront");
    expect(token.address).eq(token.options.address).eq("0x495f947276749Ce646f68AC8c248420045cb7b5e");
    expect(token.abi).deep.eq(token.options.jsonInterface);
  });
});
