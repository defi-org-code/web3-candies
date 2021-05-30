// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Example is ERC20("Example", "EX") {
    using SafeERC20 for IERC20;
    address public immutable deployer;

    constructor() {
        deployer = msg.sender;
    }
}
