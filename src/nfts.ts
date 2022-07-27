import { Abi, contract } from "./contracts";
import type { ERC1155, ERC721 } from "./abi";

export const erc721abi = require("./abi/ERC721.json") as Abi;
export const erc1155abi = require("./abi/ERC1155.json") as Abi;

type IToken = {
  /**
   * human readable name
   */
  name: string;
  /**
   * alias for token.options.address
   */
  address: string;
  /**
   * alias for token.options.jsonInterface
   */
  abi: Abi;
};

export type TokenERC721 = ERC721 & IToken;
export type TokenERC1155 = ERC1155 & IToken;

export function erc721<T>(name: string, address: string, extendAbi?: Abi): TokenERC721 & T {
  const abi = extendAbi ? [...erc721abi, ...extendAbi] : erc721abi;
  const result = contract<TokenERC721 & T>(abi, address);
  result.name = name;
  result.address = address;
  result.abi = abi;
  tryTag(address, name);
  return result;
}

export function erc1155<T>(name: string, address: string, extendAbi?: Abi): TokenERC1155 & T {
  const abi = extendAbi ? [...erc1155abi, ...extendAbi] : erc1155abi;
  const result = contract<TokenERC1155 & T>(abi, address);
  result.name = name;
  result.address = address;
  result.abi = abi;
  tryTag(address, name);
  return result;
}

function tryTag(address: string, name: string) {
  try {
    if (process.env.NODE) eval("require")("./hardhat").tag(address, name);
  } catch (ignore) {}
}
