import { Abi, contract } from "./contracts";

export const erc721abi = require("./abi/ERC721.json") as Abi;
export const erc1155abi = require("./abi/ERC1155.json") as Abi;

export function erc721<T>(name: string, address: string, extendAbi?: Abi) {
  const abi = extendAbi ? [...erc721abi, ...extendAbi] : erc721abi;
  const result = contract<any>(abi, address);
  result.name = name;
  result.address = address;
  result.abi = abi;
  return result;
}

export function erc1155<T>(name: string, address: string, extendAbi?: Abi) {
  const abi = extendAbi ? [...erc1155abi, ...extendAbi] : erc1155abi;
  const result = contract<any>(abi, address);
  result.name = name;
  result.address = address;
  result.abi = abi;
  return result;
}
