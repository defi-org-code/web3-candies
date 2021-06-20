# Web3 Candies 🍬🍭🍦

> Sweet web3 + hardhat development stack

## Installation

`npm install --save web3-candies`

if not using hardhat:
`npm install --save web3-candies --no-optional` to skip optional hardhat dependencies.

## Usage example

```typescript
import { bn18, fmt18, ether, erc20s, erc20, account, max } from "web3-candies";

const x = bn18("1,000.1234"); // x = "1000123400000000000000" [bn.js object representing wei, parsed with 18 decimals]
console.log(x.gt(ether)); // true
console.log(fmt18(x)); // prints "1,000.1234"

const owner = await account(); // web3 test account [0]

await erc20s.eth.WETH().methods.balanceOf(owner).call(); // WETH balance of

const myToken = erc20("foo", myTokenAddress); // web3 instantiated ERC20 Contract tagged as 'foo' in logs
await myToken.methods.approve(other, max).send({ from: owner }); // approve max uint value for other to spend
```

## Sweets included

> See the tests for working examples

### bn.js utils

- `bn`: convert `string|number|bn` to `bn.js` object
- `bn6, bn8, bn9, bn12, bn18`: convert human readable `string|number` to `bn.js` object, handling commas and decimals
- `fmt6, fmt8, fmt9, fmt12, fmt18`: convert `bn.js` object to human readable `string`, handling commas and decimals
- `zero, ether, max`: hardcoded useful values

### ERC20

- `erc20s.eth...`: well known Ethereum ERC20 contracts
- `erc20s.bsc...`: well known BinanceSmartChain ERC20 contracts
- `erc20<T>(...)`: web3 ERC20 contract, with optional additional abi

### contract utils

- `contract<T>(...)`: create web3 Contract instance, supporting types
- `deployArtifact(...)`: quickly deploy a compiled contract, for ex from tests
- `parseEvents`: parse tx receipt events
- `deploy(...)`: deployment script with prompts and confirmations, saves deployments locally, optionally uploads sources to etherscan

### network utils

- `hre()`, `web3()`: the globally accesible singletons
- `ethChainId`, `bscChainId`: constants
- `account`: alias for web3.accounts
- `artifact`: read compiled artifact
- `tag`: tag address for use with hre.tracer in logs
- `impersonate`: impersonate accounts
- `resetNetworkFork`: resets the fork, with optional blockNumber
- `mineBlocks`: mine blocks in a loop, simulating chain progression with timestamps
- `mineBlock`: mine a single block with the given timestamp
- `getNetworkForkingBlockNumber`, `getNetworkForkingUrl`: read hardhat config

### test utils

- `expectRevert`: expects given fn to revert

### peerDependencies

- Default (recommended) Web3 + Hardhat development dependencies are installed
  - Use the bundled tsconfig, solhint, and other project files as a starting point
