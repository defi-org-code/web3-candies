import { Abi, contract } from "./contracts";
import { ERC721 } from "./abi/ERC721";
import { IERC1155 } from "./abi/IERC1155";

export const erc721abi = require("./abi/ERC721.json") as Abi;
export const erc1155abi = require("./abi/IERC1155.json") as Abi;

export type TokenERC721 = ERC721;
export type TokenIERC1155 = IERC1155;

export function erc721<T>(name: string, address: string, extendAbi?: Abi): TokenERC721 & T {
  const abi = extendAbi ? [...erc721abi, ...extendAbi] : erc721abi;
  const result = contract<TokenERC721 & T>(abi, address);
  tryTag(address, name);
  return result;
}

export function erc1155<T>(name: string, address: string, extendAbi?: Abi): TokenIERC1155 & T {
  const abi = extendAbi ? [...erc1155abi, ...extendAbi] : erc1155abi;
  const result = contract<TokenIERC1155 & T>(abi, address);
  tryTag(address, name);
  return result;
}

function tryTag(address: string, name: string) {
  try {
    if (process.env.NODE) eval("require")("./hardhat").tag(address, name);
  } catch (ignore) {}
}
