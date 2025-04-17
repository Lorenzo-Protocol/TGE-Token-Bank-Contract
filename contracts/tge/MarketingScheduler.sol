// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Scheduler.sol";

contract MarketingScheduler is Scheduler {

    constructor(
        uint256 _tgeAt,
        address _tgeContract,
        uint256 _totalGrantAmount,
        uint256 _tgeUnlockAmount,
        uint256 _cliffMonths,
        uint256 _releaseMonths,
        address[] memory _claimers
    ) Scheduler(_tgeAt, _tgeContract, _totalGrantAmount, _tgeUnlockAmount, _cliffMonths, _releaseMonths, _claimers) {}

    // @dev to calculate the pending amount to claim till now
    function getPendingAmount() public override view returns (uint256) {
        uint256 calculateTime = block.timestamp > claimEndTs ? claimEndTs : block.timestamp;
        uint256 passedMonths = calculateTime <= claimStartTs ?
                               0 :
                               (calculateTime - claimStartTs) / EachClaimDuration;
        uint256 totalClaimableAmount;
        if (passedMonths >= releaseMonths) {
        // release all of the grant amount after 6 months
            totalClaimableAmount = totalGrantAmount;
        } else if (passedMonths >= releaseMonths / 2) {
            // release half of the grant amount after 3 months
            totalClaimableAmount = totalGrantAmount / 2;
        }

        return totalClaimableAmount - totalClaimedAmount;
    }
}

