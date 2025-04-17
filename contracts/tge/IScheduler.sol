// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IScheduler {
    function getPendingAmount() external view returns (uint256);
    function claim(address claimer, address to, uint256 amount) external;
}
