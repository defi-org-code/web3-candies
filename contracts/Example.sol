// SPDX-License-Identifier: MIT

pragma solidity 0.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Example2 {
    event ExampleEvent(string foo);

    function testEvent() public {
        emit ExampleEvent("bar");
    }
}

contract Example is ERC20("Example", "EX") {
    struct S {
        uint256 a;
    }

    using SafeERC20 for IERC20;
    address public immutable deployer;

    constructor(
        uint256 foo,
        address bar,
        S memory s
    ) {
        require(foo > 0 && bar != address(0) && s.a > 0, "testing constructor args");
        deployer = msg.sender;
    }

    function assertNotZero(uint256 n) external pure returns (uint256) {
        require(n > 0, "n should not be zero");
        return n;
    }

    function testInnerEvent() external {
        Example2 e = new Example2();
        e.testEvent();
    }
}
