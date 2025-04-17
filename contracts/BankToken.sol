// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract BankToken is ERC20Capped {
    uint256 public constant MAX_SUPPLY = 2_100_000_000 ether; // 2.1 billion tokens

    address public immutable tgeContract;
    constructor(
        address _tgeContract
    )
        ERC20Capped(MAX_SUPPLY)
        ERC20("Lorenzo Governance Token", "BANK")
    {
        tgeContract = _tgeContract;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == tgeContract, "Only TGE contract");
        _mint(to, amount);
    }
}
