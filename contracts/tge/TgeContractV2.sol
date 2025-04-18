// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./IScheduler.sol";
import "./Scheduler.sol";
import "./MarketingScheduler.sol";
import "./TgeContract.sol";

contract TgeContractV2 is TgeContract {
    // investors role
    uint256 public constant ROLE_INVESTORS_PERCENT_V2           = 0.25e18; // 25%
    uint256 public constant ROLE_INVESTORS_CLIFF_MONTHS_V2      = 12; // 12 months
    uint256 public constant ROLE_INVESTORS_RELEASE_MONTHS_V2    = 36; // 36 months
    uint256 public constant ROLE_INVESTORS_TGEUNLOCK_PERCENT_V2 = 0; // 0%

    // team role
    uint256 public constant ROLE_TEAM_PERCENT_V2           = 0.15e18; // 15%
    uint256 public constant ROLE_TEAM_CLIFF_MONTHS_V2      = 12; // 12 months
    uint256 public constant ROLE_TEAM_RELEASE_MONTHS_V2    = 48; // 48 months
    uint256 public constant ROLE_TEAM_TGEUNLOCK_PERCENT_V2 = 0; // 0%

    // advisors role
    uint256 public constant ROLE_ADVISORS_PERCENT_V2           = 0.05e18; // 5%
    uint256 public constant ROLE_ADVISORS_CLIFF_MONTHS_V2      = 12; // 12 months
    uint256 public constant ROLE_ADVISORS_RELEASE_MONTHS_V2    = 48; // 48 months
    uint256 public constant ROLE_ADVISORS_TGEUNLOCK_PERCENT_V2 = 0; // 0%

    function onUpgradeToV2(
        uint256 _tgeAt,
        address[] memory _investorsClaimers,
        address[] memory _teamClaimers,
        address[] memory _advisorsClaimers
    ) public onlyOwner {
        schedulers[ROLE_INVESTORS] = new Scheduler(
            _tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_INVESTORS_PERCENT_V2 / PRECISION,
            MAX_SUPPLY * ROLE_INVESTORS_TGEUNLOCK_PERCENT_V2 / PRECISION,
            ROLE_INVESTORS_CLIFF_MONTHS_V2,
            ROLE_INVESTORS_RELEASE_MONTHS_V2,
            _investorsClaimers
        );

        schedulers[ROLE_TEAM] = new Scheduler(
            _tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_TEAM_PERCENT_V2 / PRECISION,
            MAX_SUPPLY * ROLE_TEAM_TGEUNLOCK_PERCENT_V2 / PRECISION,
            ROLE_TEAM_CLIFF_MONTHS_V2,
            ROLE_TEAM_RELEASE_MONTHS_V2,
            _teamClaimers
        );

        schedulers[ROLE_ADVISORS] = new Scheduler(
            _tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_ADVISORS_PERCENT_V2 / PRECISION,
            MAX_SUPPLY * ROLE_ADVISORS_TGEUNLOCK_PERCENT_V2 / PRECISION,
            ROLE_ADVISORS_CLIFF_MONTHS_V2,
            ROLE_ADVISORS_RELEASE_MONTHS_V2,
            _advisorsClaimers
        );
    }
}
