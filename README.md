# Web3 Candies 🍬🍭🍦

> Sweet Web3 + TypeScript + HardHat (optional) development stack

## Installation

`npm install --save @defi.org/web3-candies`

**If not using hardhat, or running in a browser**, skip the optional dependencies: `--omit optional`

## Usage example

```typescript
import { bn, bn18, bnm, ether, erc20s, erc20, account, maxUint256 } from "@defi.org/web3-candies";
import { resetNetworkFork } from "@defi.org/web3-candies/dist/hardhat"; // to allow hardhat dependencies to be optional

const x = bn18(1000.1234); // x = "1000123400000000000000" [BigNumber.js object representing wei, parsed with 18 decimals]
console.log(x.gt(ether)); // true
console.log(bnm(x).toFormat()); // prints "1,000.1234"

const owner = await account(); // web3 account [0]

console.log(await erc20s.eth.WETH().amount(123.456)); // prints 123456000000000000000
console.log(await erc20s.eth.USDC().mantissa("123123456789")); // prints 123123.456789
console.log(await erc20s.eth.USDC().to18("123456000")); // prints 123456000000000000000 (18 decimals)

const myToken = erc20("foo", myTokenAddress); // web3 instantiated ERC20 Contract
await myToken.methods.approve(other, maxUint256).send({ from: owner }); // approve max uint value for other to spend
```

> run tests with env variable `DEBUG=web3-candies` to see logs

> use `hardhatDefaultConfig` in hardhat.config.ts for sugary hardhat defaults

## Sweets included

> See the tests for working examples

- `estimateGasPrices()`: simple implementation of gas estimator for slow/avg/fast gas price

### BigNumber.js utils

- `bn`: convert `string|number|BN|BigNumber` to `BigNumber.js` object
- `bne`: exponentiate n to decimals (`bne(123.456789, 3) ==> 123456`)
- `bnm`: mantissa of n in decimals (`bnm(123456.789, 3) ==> 123.456789`)
- `bn6, bn9, bn18`: convenience functions for bn with `6,9,18` decimals
- `zero, one, ten, ether, maxUint256, zeroAddress`: hardcoded useful values
- `parsebn`: parse formatted human-readable string to `BigNumber.js` object
- `convertDecimals`: convert from source decimals to target decimals

### ERC20s, NFTs

- `erc20s.eth/bsc/poly/arb/avax/oeth/ftm...`: well known ERC20 base tokens per network
- `erc20<T>(...)`: web3 ERC20 contract, with optional extending abi to merge
- `await erc20s.eth.WETH().decimals()`: memoized version of decimals method
- `await erc20s.eth.WETH().amount(1.234)`: returns amount in wei, converted to token decimals (in this case `1234000000000000000`) (memoized)
- `await erc20s.eth.USDC().mantissa(123123456789)`: returns token amount to mantissa with decimals (in this case `123123.456789`) (memoized)
- `await erc20s.eth.USDC().to18(100)`: returns amount in **18 decimals**, given amount in token decimals (in this case `100e18`) (memoized)

### contract utils

- `contract<T>(...)`: create web3 Contract instance, supporting types
- `deployArtifact(...)`: quickly deploy a compiled contract, for ex from tests
- `parseEvents`: parse tx receipt events
- `etherscanVerify(...)`: verify sources for previously deployed contracts
- `waitForTxConfirmations`: pass tx object to wait for tx confirmations

### network utils

- `web3()`: the globally accesible singleton. call `setWeb3Instance(web3)` if needed
- `networks.eth/bsc/poly/arb/avax/oeth/ftm...`: constants
- `account`: alias for web3.accounts
- `block`: alias for web3.getBlock, with parsed timestamp (seconds)
- `findBlock`: find a block closest to timestamp (millis)

### hardhat utils

> to allow hh to be optional, import from '@defi.org/web3-candies/dist/hardhat'

- `dist/hardhat/deploy`: deployment script with prompts and confirmations, saves deployment artifacts locally, waits for confirmations, optionally verifies sources on etherscan
- `hardhatDefaultConfig`: sweet hardhat config
- `gasReportedConfig`: hardhat-gas-reporter preconfigured config
- `hre()`: the globally accessible singleton
- `tag`: tag address for use with `hre.tracer` in logs
- `artifact`: read compiled artifact
- `impersonate`: impersonate accounts
- `setBalance`: sets account native token balance
- `resetNetworkFork`: resets the fork, with optional blockNumber
- `getNetworkForkingBlockNumber`, `getNetworkForkingUrl`: read hardhat config
- `mineBlocks`: mine blocks in a loop, simulating chain progression with seconds
- `mineBlock`: mine a single block with the given added seconds

### test utils

- `useChaiBigNumber()`: hoist and use `@defi.org/chai-bignumber` mocha+chai assertions
- `expectRevert`: expects given fn to revert, containing reason string or regex

### timing utils

- `throttle(this, seconds, fn)`: sugar for lodash throttle
- `sleep`: async sleep seconds
- `keepTrying`: keep trying to invoke fn catching and logging exceptions, with 1 sec sleep between invocations
- `preventMacSleep`: runs a shell subprocess that prevents macbooks from sleeping

### peerDependencies

- Default (recommended) Web3 + Hardhat development dependencies are installed
  - Use the bundled tsconfig, solhint, and other project files as a starting point

### How to manually verify sources in Etherscan in case of an error during deploy?

- First, try running `etherscanVerify`
- After running `deploy` script, the `deployments` artifact backup should hold build-info json with all the metadata required
- Alternatively, after compiling with hardhat, `./artifacts/build-info` should have this json
- Extract the object under `input`: this is the Solidity standard-json-input required by Etherscan
- Constructor arguments should be sent abi-encoded to Etherscan, this is printed during the deploy script, also accessible via `abiEncodedConstructorArgs` function
