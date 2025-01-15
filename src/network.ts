import { _TypedDataEncoder } from "@ethersproject/hash";
import { recoverPublicKey } from "@ethersproject/signing-key";
import { computeAddress } from "@ethersproject/transactions";
import BN from "bignumber.js";
import Web3 from "web3";
import opOracle from "./abi/opOracle.json";
import permit2Abi from "./abi/IPermit2.json";
import { BlockInfo, BlockNumber, contract, Contract } from "./contracts";
import { erc20sData, TokenData } from "./erc20";
import { keepTrying, timeout } from "./timing";
import { eqIgnoreCase, median, zeroAddress } from "./utils";

export { joinSignature, splitSignature, zeroPad } from "@ethersproject/bytes";

/**
 * to extend: `const mynetworks = _.merge({}, networks, { eth: { foo: 123 }})`
 */
export const networks = {
  eth: {
    id: 1,
    name: "Ethereum",
    shortname: "eth",
    native: {
      address: zeroAddress,
      symbol: "ETH",
      decimals: 18,
      logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
    },
    wToken: erc20sData.eth.WETH,
    publicRpcUrl: "https://eth.llamarpc.com",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
    explorer: "https://etherscan.io",
    eip1559: true,
  },
  bsc: {
    id: 56,
    name: "BinanceSmartChain",
    shortname: "bsc",
    native: {
      address: zeroAddress,
      symbol: "BNB",
      decimals: 18,
      logoUrl: "https://app.1inch.io/assets/images/network-logos/bsc_2.svg",
    },
    wToken: erc20sData.bsc.WBNB,
    publicRpcUrl: "https://bsc-dataseed.binance.org",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/bsc_2.svg",
    explorer: "https://bscscan.com",
    eip1559: false,
  },
  poly: {
    id: 137,
    name: "Polygon",
    shortname: "poly",
    native: {
      address: zeroAddress,
      symbol: "MATIC",
      decimals: 18,
      logoUrl: "https://app.1inch.io/assets/images/network-logos/polygon.svg",
    },
    wToken: erc20sData.poly.WMATIC,
    publicRpcUrl: "https://polygon-rpc.com",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/polygon.svg",
    explorer: "https://polygonscan.com",
    eip1559: true,
  },
  arb: {
    id: 42161,
    name: "Arbitrum",
    shortname: "arb",
    native: {
      address: zeroAddress,
      symbol: "ETH",
      decimals: 18,
      logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
    },
    wToken: erc20sData.arb.WETH,
    publicRpcUrl: "https://arb1.arbitrum.io/rpc",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/arbitrum.svg",
    explorer: "https://arbiscan.io",
    eip1559: true,
  },
  sei: {
    id: 1329,
    name: "Sei",
    shortname: "sei",
    native: {
      address: zeroAddress,
      symbol: "SEI",
      decimals: 18,
      logoUrl: "https://assets.coingecko.com/coins/images/28205/standard/Sei_Logo_-_Transparent.png",
    },
    wToken: erc20sData.sei.WSEI,
    publicRpcUrl: "https://evm-rpc.sei-apis.com",
    logoUrl: "https://assets.coingecko.com/coins/images/28205/standard/Sei_Logo_-_Transparent.png",
    explorer: "https://seitrace.com",
    eip1559: false,
  },
  avax: {
    id: 43114,
    name: "Avalanche",
    shortname: "avax",
    native: {
      address: zeroAddress,
      symbol: "AVAX",
      decimals: 18,
      logoUrl: "https://app.1inch.io/assets/images/network-logos/avalanche.svg",
    },
    wToken: erc20sData.avax.WAVAX,
    publicRpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/avalanche.svg",
    explorer: "https://snowtrace.io",
    eip1559: true,
  },
  oeth: {
    id: 10,
    name: "Optimism",
    shortname: "oeth",
    native: {
      address: zeroAddress,
      symbol: "ETH",
      decimals: 18,
      logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
    },
    wToken: erc20sData.oeth.WETH,
    publicRpcUrl: "https://mainnet.optimism.io",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/optimism.svg",
    explorer: "https://optimistic.etherscan.io",
    eip1559: true,
  },
  ftm: {
    id: 250,
    name: "Fantom",
    shortname: "ftm",
    native: {
      address: zeroAddress,
      symbol: "FTM",
      decimals: 18,
      logoUrl: "https://app.1inch.io/assets/images/network-logos/fantom.svg",
    },
    wToken: erc20sData.ftm.WFTM,
    publicRpcUrl: "https://rpc.ftm.tools",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/fantom.svg",
    explorer: "https://ftmscan.com",
    eip1559: true,
  },
  glmr: {
    id: 1284,
    name: "Moonbeam",
    shortname: "glmr",
    native: {
      address: zeroAddress,
      symbol: "GLMR",
      decimals: 18,
      logoUrl: "https://moonscan.io/images/svg/brands/mainbrand-1.svg",
    },
    wToken: erc20sData.glmr.WGLMR,
    publicRpcUrl: "https://rpc.api.moonbeam.network",
    logoUrl: "https://moonscan.io/images/svg/brands/mainbrand-1.svg",
    explorer: "https://moonscan.io",
    eip1559: true,
  },
  base: {
    id: 8453,
    name: "Base",
    shortname: "base",
    native: {
      address: zeroAddress,
      symbol: "ETH",
      decimals: 18,
      logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
    },
    wToken: erc20sData.base.WETH,
    publicRpcUrl: "https://mainnet.base.org",
    logoUrl: "https://app.1inch.io/assets/images/network-logos/base.svg",
    explorer: "https://basescan.org",
    eip1559: false,
  },
  linea: {
    id: 59144,
    name: "Linea",
    shortname: "linea",
    native: {
      address: zeroAddress,
      symbol: "ETH",
      decimals: 18,
      logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
    },
    wToken: erc20sData.linea.WETH,
    publicRpcUrl: "https://rpc.linea.build",
    logoUrl: "https://lineascan.build/images/logo.svg",
    explorer: "https://lineascan.build",
    eip1559: false,
  },
  zksync: {
    id: 324,
    name: "zksync",
    shortname: "zksync",
    native: {
      address: zeroAddress,
      symbol: "ETH",
      decimals: 18,
      logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
    },
    wToken: erc20sData.zksync.WETH,
    publicRpcUrl: "https://mainnet.era.zksync.io",
    logoUrl: "https://raw.githubusercontent.com/matter-labs/zksync/0a4ca2145a0c95b5bafa84c2f095c644907a8825/zkSyncLogo.svg",
    explorer: "https://explorer.zksync.io/",
    eip1559: true,
  },
  zkevm: {
    id: 1101,
    name: "zkevm",
    shortname: "zkevm",
    native: {
      address: zeroAddress,
      symbol: "ETH",
      decimals: 18,
      logoUrl: "https://app.1inch.io/assets/images/network-logos/ethereum.svg",
    },
    wToken: erc20sData.zkevm.WETH,
    publicRpcUrl: "https://zkevm-rpc.com",
    logoUrl: "https://user-images.githubusercontent.com/18598517/235932702-bc47eae5-d672-4dd9-9da2-8ea8f51a93f3.png",
    explorer: "https://zkevm.polygonscan.com/",
    eip1559: true,
  },
  manta: {
    id: 169,
    name: "manta",
    shortname: "manta",
    native: {
      address: zeroAddress,
      symbol: "ETH",
      decimals: 18,
      logoUrl: "https://icons.llamao.fi/icons/chains/rsz_manta.jpg",
    },
    wToken: erc20sData.manta.WETH,
    publicRpcUrl: "https://pacific-rpc.manta.network/http",
    logoUrl: "https://icons.llamao.fi/icons/chains/rsz_manta.jpg",
    explorer: "https://manta.socialscan.io/",
    eip1559: true,
  },
  blast: {
    id: 81457,
    name: "blast",
    shortname: "blast",
    native: {
      address: zeroAddress,
      symbol: "ETH",
      decimals: 18,
      logoUrl: "https://icons.llamao.fi/icons/chains/rsz_blast",
    },
    wToken: erc20sData.blast.WETH,
    publicRpcUrl: "https://rpc.ankr.com/blast",
    logoUrl: "https://icons.llamao.fi/icons/chains/rsz_blast",
    explorer: "https://blastscan.io/",
    eip1559: true,
  },
  sonic: {
    id: 146,
    name: "sonic",
    shortname: "sonic",
    native: {
      address: zeroAddress,
      symbol: "S",
      decimals: 18,
      logoUrl: "https://icons.llamao.fi/icons/chains/rsz_sonic",
    },
    wToken: erc20sData.sonic.WS,
    publicRpcUrl: "https://rpc.soniclabs.com",
    logoUrl: "https://icons.llamao.fi/icons/chains/rsz_sonic",
    explorer: "https://www.sonicscan.org/",
    eip1559: true,
  },
  scroll: {
    id: 534352,
    name: "scroll",
    shortname: "scroll",
    native: {
      address: zeroAddress,
      symbol: "ETH",
      decimals: 18,
      logoUrl: "https://icons.llamao.fi/icons/chains/rsz_scroll",
    },
    wToken: erc20sData.scroll.WETH,
    publicRpcUrl: "https://scroll-rpc.publicnode.com",
    logoUrl: "https://icons.llamao.fi/icons/chains/rsz_scroll",
    explorer: "https://scrollscan.com/",
    eip1559: true,
  },
  cronoszkevm: {
    id: 388,
    name: "cronoszkevm",
    shortname: "cronoszkevm",
    native: {
      address: zeroAddress,
      symbol: "zkCRO",
      decimals: 18,
      logoUrl: "https://cryptologos.cc/logos/cronos-cro-logo.png?v=040",
    },
    wToken: erc20sData.cronoszkevm.wzkCRO,
    publicRpcUrl: "https://rpc.soniclabs.com",
    logoUrl: "https://cryptologos.cc/logos/cronos-cro-logo.png?v=040",
    explorer: "https://explorer.zkevm.cronos.org/",
    eip1559: true,
  },
};

/**
 * hardhat injected web3 instance, or the global singleton
 */
export function web3(): Web3 {
  if (web3Instance) return web3Instance;
  if (!web3Instance) throw new Error(`web3 undefined! call "setWeb3Instance" or install optional HardHat dependency`);
  return web3Instance;
}

let web3Instance: Web3;

export function setWeb3Instance(web3: any) {
  web3Instance = web3;
}

export function hasWeb3Instance() {
  try {
    return !!web3();
  } catch (ignore) {
    return !!web3Instance;
  }
}

export function network(chainId: number) {
  return Object.values(networks).find((n:any) => n.id === chainId)!;
}

export async function chainId(w3?: Web3) {
  return await (w3 || web3()).eth.getChainId();
}

export function isWrappedToken(chainId: number, address: string) {
  return eqIgnoreCase(network(chainId).wToken.address, address);
}

export async function account(num: number = 0): Promise<string> {
  return (await web3().eth.getAccounts())[num];
}

export async function block(blockHashOrBlockNumber?: BlockNumber | string): Promise<BlockInfo> {
  const r = await web3().eth.getBlock(blockHashOrBlockNumber || "latest");
  if (!r || !r.timestamp) throw new Error(`block ${blockHashOrBlockNumber} not found`);
  r.timestamp = typeof r.timestamp == "number" ? r.timestamp : parseInt(r.timestamp);
  return r as BlockInfo;
}

export async function findBlock(timestamp: number): Promise<BlockInfo> {
  const targetTimestampSecs = Math.floor(timestamp / 1000);
  const currentBlock = await block();
  if (targetTimestampSecs > currentBlock.timestamp) throw new Error(`findBlock: ${new Date(timestamp)} is in the future`);

  let candidate = await block(currentBlock.number - 10_000);
  const avgBlockDurationSec = Math.max(0.1, (currentBlock.timestamp - candidate.timestamp) / 10_000);

  let closestDistance = Number.POSITIVE_INFINITY;
  while (Math.abs(candidate.timestamp - targetTimestampSecs) >= avgBlockDurationSec) {
    const distanceInSeconds = candidate.timestamp - targetTimestampSecs;
    const estDistanceInBlocks = Math.floor(distanceInSeconds / avgBlockDurationSec);
    if (Math.abs(estDistanceInBlocks) > closestDistance) break;

    closestDistance = Math.abs(estDistanceInBlocks);
    const targeting = candidate.number - estDistanceInBlocks;
    if (targeting < 0) throw new Error("findBlock: target block is before the genesis block");
    candidate = await block(targeting);
  }

  return candidate;
}

export async function switchMetaMaskNetwork(chainId: number) {
  const provider = (web3() as any).provider || web3().currentProvider;
  if (!provider) throw new Error(`no provider`);

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: Web3.utils.toHex(chainId) }],
    });
  } catch (error: any) {
    // if unknown chain, add chain
    if (error.code === 4902) {
      const info = network(chainId);
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: Web3.utils.toHex(chainId),
            chainName: info.name,
            nativeCurrency: info.native,
            rpcUrls: [info.publicRpcUrl],
            blockExplorerUrls: [info.explorer],
            iconUrls: [info.logoUrl],
          },
        ],
      });
    } else throw error;
  }
}

/**
 * @returns median gas prices for slow (10th percentile), med (50th percentile) and fast (90th percentile) of the last {length = 5} blocks, in wei
 */
export async function estimateGasPrice(
  percentiles: number[] = [10, 50, 90],
  length: number = 5,
  w3?: Web3,
  timeoutMillis: number = 1000,
  supportEIP1559: boolean = true
): Promise<{
  slow: { max: BN; tip: BN };
  med: { max: BN; tip: BN };
  fast: { max: BN; tip: BN };
  baseFeePerGas: BN;
  blockNumber: number;
  blockTimestamp: number;
}> {
  if (process.env.NETWORK_URL && !w3) w3 = new Web3(process.env.NETWORK_URL);
  w3 = w3 || web3();

  return await keepTrying(
    async () => {
      if (supportEIP1559) {
        const [block, history] = await Promise.all([
          w3!.eth.getBlock("latest"),
          !!w3!.eth.getFeeHistory ? w3!.eth.getFeeHistory(length, "latest", percentiles) : Promise.resolve({ reward: [] }),
        ]);

        const baseFeePerGas = BN(block.baseFeePerGas || 0);

        const slow = BN.max(1, median(history.reward.map((r: any) => BN(r[0], 16))));
        const med = BN.max(1, median(history.reward.map((r:any) => BN(r[1], 16))));
        const fast = BN.max(1, median(history.reward.map((r:any) => BN(r[2], 16))));

        return {
          slow: { max: baseFeePerGas.times(1).plus(slow).integerValue(), tip: slow.integerValue() },
          med: { max: baseFeePerGas.times(1.1).plus(med).integerValue(), tip: med.integerValue() },
          fast: { max: baseFeePerGas.times(1.25).plus(fast).integerValue(), tip: fast.integerValue() },
          baseFeePerGas,
          blockNumber: block.number,
          blockTimestamp: BN(block.timestamp).toNumber(),
        };
      } else {
        const [block, price] = await Promise.all([w3!.eth.getBlock("latest"), w3!.eth.getGasPrice()]);

        const priceBN = new BN(price);

        let slow = priceBN.times(1).integerValue();
        let med = priceBN.times(1.1).integerValue();
        let fast = priceBN.times(1.25).integerValue();

        return {
          slow: { max: slow, tip: slow },
          med: { max: med, tip: med },
          fast: { max: fast, tip: fast },
          baseFeePerGas: priceBN,
          blockNumber: block.number,
          blockTimestamp: BN(block.timestamp).toNumber(),
        };
      }
    },
    3,
    timeoutMillis
  );
}

/**
 * @param txData: Unsigned fully RLP-encoded transaction to get the L1 gas for
 *  https://community.optimism.io/docs/developers/build/transaction-fees/#priority-fee
 *  tx_data_gas = count_zero_bytes(tx_data) * 4 + count_non_zero_bytes(tx_data) * 16
 */
export function calculateL1GasUnits(txData: string): BN {
  let zeroCount = 0;
  let nonZeroCount = 0;
  const bytes = Web3.utils.hexToBytes(txData);

  for (const b of bytes) {
    !b ? zeroCount++ : nonZeroCount++;
  }

  return new BN(zeroCount * 4 + nonZeroCount * 16);
}

export async function estimateL1GasPrice(txData: string = "0x00", w3?: Web3) {
  if (process.env.NETWORK_URL && !w3) w3 = new Web3(process.env.NETWORK_URL);
  w3 = w3 || web3();

  const ORACLE = "0x420000000000000000000000000000000000000F";

  const c = contract<any>(opOracle as any, ORACLE, undefined, w3);
  return c.methods.getL1Fee(txData).call();
}

export async function getPastEvents(params: {
  contract: Contract;
  eventName: string | "all";
  filter: { [key: string]: string | number };
  fromBlock: number;
  toBlock?: number;
  minDistanceBlocks?: number;
  maxDistanceBlocks?: number;
  latestBlock?: number;
  iterationTimeoutMs?: number;
}): Promise<any[]> {
  params.toBlock = params.toBlock || Number.MAX_VALUE;
  params.maxDistanceBlocks = params.maxDistanceBlocks || Number.MAX_VALUE;
  params.minDistanceBlocks = Math.min(params.minDistanceBlocks || 1000, params.maxDistanceBlocks);
  params.iterationTimeoutMs = params.iterationTimeoutMs || 5000;
  params.latestBlock = params.latestBlock || (await web3().eth.getBlockNumber());
  params.fromBlock = params.fromBlock < 0 ? params.latestBlock! + params.fromBlock : params.fromBlock;
  params.toBlock = Math.min(params.latestBlock!, params.toBlock);
  const distance = params.toBlock - params.fromBlock;

  const call = () =>
    params.contract.getPastEvents((params.eventName === "all" ? undefined : params.eventName) as any, {
      filter: params.filter,
      fromBlock: params.fromBlock,
      toBlock: params.toBlock,
    });

  if (!params.maxDistanceBlocks || distance <= params.maxDistanceBlocks) {
    try {
      return await timeout(call, distance > params.minDistanceBlocks ? params.iterationTimeoutMs : 5 * 60 * 1000);
    } catch (e: any) {
    }
  }

  if (distance <= params.minDistanceBlocks) {
    return await call();
  } else {
    return (await getPastEvents({ ...params, toBlock: Math.floor(params.fromBlock + distance / 2) })).concat(
      await getPastEvents({ ...params, fromBlock: Math.floor(params.fromBlock + distance / 2) + 1 })
    );
  }
}

/**
 * signs with EIP-712 falling back to eth_sign
 */
export async function signEIP712(signer: string, data: any) {
  // Populate any ENS names (in-place)
  const populated = await _TypedDataEncoder.resolveNames(data.domain, data.types, data.values, async (name: string) => web3().eth.ens.getAddress(name));
  const typedDataMessage = _TypedDataEncoder.getPayload(populated.domain, data.types, populated.value);

  try {
    return await signAsync("eth_signTypedData_v4", signer, typedDataMessage);
  } catch (e: any) {
    try {
      return await signAsync("eth_signTypedData", signer, typedDataMessage);
    } catch (e: any) {
      throw e;
    }
  }
}

export async function signAsync(method: "eth_signTypedData_v4" | "eth_signTypedData", signer: string, payload: string | any) {
  const provider: any = (web3().currentProvider as any).send ? web3().currentProvider : (web3() as any)._provider;
  return await new Promise<string>((resolve, reject) => {
    provider.send(
      {
        id: 1,
        method,
        params: [signer, typeof payload === "string" ? payload : JSON.stringify(payload)],
        from: signer,
      },
      (e: any, r: any) => {
        if (e || !r?.result) return reject(e);
        return resolve(r.result);
      }
    );
  });
}

export function recoverEIP712Signer(signature: string, data: any) {
  const hash = _TypedDataEncoder.hash(data.domain, data.types, data.values);
  return computeAddress(recoverPublicKey(hash, signature));
}

export const permit2Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

export function permit2Approve(
  token: TokenData,
  spender: string,
  amount: BN.Value = "0xffffffffffffffffffffffffffffffffffffffff",
  deadline: BN.Value = "0xffffffffffff"
) {
  return contract<any>(permit2Abi as any, permit2Address).methods.approve(token.address, spender, BN(amount).toFixed(0), BN(deadline).toFixed(0));
}

export function permit2TransferFrom(from: string, to: string, amount: BN.Value, token: TokenData) {
  return contract<any>(permit2Abi as any, permit2Address).methods.transferFrom(from, to, BN(amount).toFixed(0), token.address);
}
