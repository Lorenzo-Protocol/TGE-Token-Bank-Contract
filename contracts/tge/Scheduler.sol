// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IScheduler.sol";

contract Scheduler is IScheduler {
    using SafeERC20 for IERC20;
    uint256 public constant EachClaimDuration = 30 days;

    event Claimed(address indexed claimer, address indexed to, uint256 amount);

    modifier onlyTgeContract() {
        require(msg.sender == tgeContract, "Only TGE contract allowed");
        _;
    }

    uint256 public immutable tgeTimestamp;      // TGE timestamp
    uint256 public immutable cliffMonths;       // Cliff months
    uint256 public immutable tgeUnlockAmount;   // TGE unlock amount
    uint256 public immutable totalGrantAmount;  // Total grant amount
    uint256 public immutable releaseMonths;     // release months
    uint256 public immutable claimStartTs;      // timestamp when claim starts
    uint256 public immutable claimEndTs;        // timestamp when claim ends
    uint256 public immutable monthlyReleaseAmount;     // monthly release amount

    address public immutable tgeContract;

    uint256 public totalClaimedAmount; // already claimed amount
    mapping(address => bool) public claimers; // claimers who can claim BANK

    constructor(
        uint256 _tgeAt,
        address _tgeContract,
        uint256 _totalGrantAmount,
        uint256 _tgeUnlockAmount,
        uint256 _cliffMonths,
        uint256 _releaseMonths,
        address[] memory _claimers
    ) {
        require(_totalGrantAmount >= _tgeUnlockAmount, "too small total grant amount");
        // CAUTION: comment out this line when upgrade to v2
        // require(_tgeAt > block.timestamp, "tgeAt too early");
        tgeTimestamp = _tgeAt;

        tgeContract = _tgeContract;
        totalGrantAmount = _totalGrantAmount;
        tgeUnlockAmount = _tgeUnlockAmount;
        cliffMonths = _cliffMonths;
        releaseMonths = _releaseMonths;
        monthlyReleaseAmount = releaseMonths > 0 ? (totalGrantAmount - tgeUnlockAmount) / releaseMonths : 0;

        claimStartTs = tgeTimestamp + cliffMonths * EachClaimDuration;
        claimEndTs = claimStartTs + releaseMonths * EachClaimDuration;

        // set claimers
        uint256 len = _claimers.length;
        for (uint256 i; i < len;) {
            claimers[_claimers[i]] = true;
            unchecked { i++; }
        }
    }

    // @dev to calculate the pending amount to claim till now
    function getPendingAmount() public virtual view returns (uint256) {
        uint256 calculateTime = block.timestamp > claimEndTs ? claimEndTs : block.timestamp;
        uint256 passedMonths = calculateTime <= claimStartTs ?
                               0 :
                               (calculateTime - claimStartTs) / EachClaimDuration;

        uint256 tgeInitialAmount = block.timestamp >= tgeTimestamp ? tgeUnlockAmount : 0;

        uint256 totalClaimableAmount = monthlyReleaseAmount * passedMonths + tgeInitialAmount;

        return totalClaimableAmount - totalClaimedAmount;
    }

    // @dev to claim the pending amount by any one of the claimers
    function claim(address claimer, address to, uint256 amount)
        external
        onlyTgeContract
    {
        require(to != address(0), "Invalid to address");
        require(claimers[claimer], "Invalid claimer");

        uint256 pendingAmount = getPendingAmount();
        require(pendingAmount >= amount, "Not enough pending amount");

        totalClaimedAmount += amount;

        emit Claimed(claimer, to, amount);
    }
}

