// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./IScheduler.sol";
import "./Scheduler.sol";
import "./MarketingScheduler.sol";

contract TgeContract is UUPSUpgradeable, OwnableUpgradeable {

    uint256 constant PRECISION = 1e18;
    uint256 public constant MAX_SUPPLY = 2_100_000_000 ether; // 2.1 billion tokens

    // rewards role
    bytes32 public constant ROLE_REWARDS                   = keccak256("ROLE_REWARDS"); // rewards role
    uint256 public constant ROLE_REWARDS_PERCENT           = 0.25e18; // 25%
    uint256 public constant ROLE_REWARDS_CLIFF_MONTHS      = 0;  // 0 months
    uint256 public constant ROLE_REWARDS_RELEASE_MONTHS    = 36; // 36 months
    uint256 public constant ROLE_REWARDS_TGEUNLOCK_PERCENT = 0.08e18; // 8% of total supply

    // investors role
    bytes32 public constant ROLE_INVESTORS                   = keccak256("ROLE_INVESTORS"); // investors role
    uint256 public constant ROLE_INVESTORS_PERCENT           = 0.25e18; // 25%
    uint256 public constant ROLE_INVESTORS_CLIFF_MONTHS      = 12; // 12 months
    uint256 public constant ROLE_INVESTORS_RELEASE_MONTHS    = 48; // 48 months
    uint256 public constant ROLE_INVESTORS_TGEUNLOCK_PERCENT = 0; // 0%

    // ecosystem role
    bytes32 public constant ROLE_ECOSYSTEM                   = keccak256("ROLE_ECOSYSTEM"); // ecosystem role
    uint256 public constant ROLE_ECOSYSTEM_PERCENT           = 0.13e18; // 13%
    uint256 public constant ROLE_ECOSYSTEM_CLIFF_MONTHS      = 12; // 12 months
    uint256 public constant ROLE_ECOSYSTEM_RELEASE_MONTHS    = 48; // 48 months
    uint256 public constant ROLE_ECOSYSTEM_TGEUNLOCK_PERCENT = 0.0325e18; // 3.25% of total supply

    // team role
    bytes32 public constant ROLE_TEAM                   = keccak256("ROLE_TEAM"); // team role
    uint256 public constant ROLE_TEAM_PERCENT           = 0.15e18; // 15%
    uint256 public constant ROLE_TEAM_CLIFF_MONTHS      = 12; // 12 months
    uint256 public constant ROLE_TEAM_RELEASE_MONTHS    = 60; // 60 months
    uint256 public constant ROLE_TEAM_TGEUNLOCK_PERCENT = 0; // 0%

    // treasury role
    bytes32 public constant ROLE_TREASURY                   = keccak256("ROLE_TREASURY"); // treasury role
    uint256 public constant ROLE_TREASURY_PERCENT           = 0.05e18; // 5%
    uint256 public constant ROLE_TREASURY_CLIFF_MONTHS      = 12; // 12 months
    uint256 public constant ROLE_TREASURY_RELEASE_MONTHS    = 48; // 48 months
    uint256 public constant ROLE_TREASURY_TGEUNLOCK_PERCENT = 0; // 0%

    // advisors role
    bytes32 public constant ROLE_ADVISORS                   = keccak256("ROLE_ADVISORS"); // advisors role
    uint256 public constant ROLE_ADVISORS_PERCENT           = 0.05e18; // 5%
    uint256 public constant ROLE_ADVISORS_CLIFF_MONTHS      = 12; // 12 months
    uint256 public constant ROLE_ADVISORS_RELEASE_MONTHS    = 60; // 60 months
    uint256 public constant ROLE_ADVISORS_TGEUNLOCK_PERCENT = 0; // 0%

    // BN IDO role
    bytes32 public constant ROLE_BN_IDO                   = keccak256("ROLE_BN_IDO"); // BN IDO role
    uint256 public constant ROLE_BN_IDO_PERCENT           = 0.02e18; // 2%
    uint256 public constant ROLE_BN_IDO_CLIFF_MONTHS      = 0; // 0 months
    uint256 public constant ROLE_BN_IDO_RELEASE_MONTHS    = 0; // 0 months
    uint256 public constant ROLE_BN_IDO_TGEUNLOCK_PERCENT = 0.02e18; // 2%

    // marketing role
    bytes32 public constant ROLE_MARKETING                   = keccak256("ROLE_MARKETING"); // BN marketing role
    uint256 public constant ROLE_MARKETING_PERCENT           = 0.03e18; // 3%
    uint256 public constant ROLE_MARKETING_CLIFF_MONTHS      = 0; // 0 months
    uint256 public constant ROLE_MARKETING_RELEASE_MONTHS    = 6; // 6 months
    uint256 public constant ROLE_MARKETING_TGEUNLOCK_PERCENT = 0; // 0%

    // listing role
    bytes32 public constant ROLE_LISTING                   = keccak256("ROLE_LISTING"); // listing role
    uint256 public constant ROLE_LISTING_PERCENT           = 0.03e18; // 3%
    uint256 public constant ROLE_LISTING_CLIFF_MONTHS      = 0; // 0 months
    uint256 public constant ROLE_LISTING_RELEASE_MONTHS    = 0; // 0 months
    uint256 public constant ROLE_LISTING_TGEUNLOCK_PERCENT = 0.03e18; // 3%

    // liquidity role
    bytes32 public constant ROLE_LIQUIDITY                   = keccak256("ROLE_LIQUIDITY"); // liquidity role
    uint256 public constant ROLE_LIQUIDITY_PERCENT           = 0.04e18; // 4%
    uint256 public constant ROLE_LIQUIDITY_CLIFF_MONTHS      = 0; // 0 months
    uint256 public constant ROLE_LIQUIDITY_RELEASE_MONTHS    = 0; // 0 months
    uint256 public constant ROLE_LIQUIDITY_TGEUNLOCK_PERCENT = 0.04e18; // 4%

    event RolePaused(bytes32 role, bool paused);
    event BankTokenSet(address bankToken);
    address public bankToken;
    mapping(bytes32 => IScheduler) public schedulers;
    mapping(bytes32 => bool)       public pausedRoles;

    constructor() {
        _disableInitializers();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    struct InitAccounts {
        address[] rewardsClaimers;
        address[] investorsClaimers;
        address[] ecosystemClaimers;
        address[] teamClaimers;
        address[] treasuryClaimers;
        address[] advisorsClaimers;
        address[] bnIdoClaimers;
        address[] marketingClaimers;
        address[] listingClaimers;
        address[] liquidityClaimers;
    }
    function initialize(
        address owner,
        uint256 tgeAt,
        InitAccounts memory initAccounts
    ) external initializer {
        require(owner != address(0), "Invalid owner");
        __Ownable_init(owner);

        // I DON'T check the initialize parameters
        schedulers[ROLE_REWARDS] = new Scheduler(
            tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_REWARDS_PERCENT / PRECISION,
            MAX_SUPPLY * ROLE_REWARDS_TGEUNLOCK_PERCENT / PRECISION,
            ROLE_REWARDS_CLIFF_MONTHS,
            ROLE_REWARDS_RELEASE_MONTHS,
            initAccounts.rewardsClaimers
        );

        schedulers[ROLE_INVESTORS] = new Scheduler(
            tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_INVESTORS_PERCENT / PRECISION,
            MAX_SUPPLY * ROLE_INVESTORS_TGEUNLOCK_PERCENT / PRECISION,
            ROLE_INVESTORS_CLIFF_MONTHS,
            ROLE_INVESTORS_RELEASE_MONTHS,
            initAccounts.investorsClaimers
        );

        schedulers[ROLE_ECOSYSTEM] = new Scheduler(
            tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_ECOSYSTEM_PERCENT / PRECISION,
            MAX_SUPPLY * ROLE_ECOSYSTEM_TGEUNLOCK_PERCENT / PRECISION,
            ROLE_ECOSYSTEM_CLIFF_MONTHS,
            ROLE_ECOSYSTEM_RELEASE_MONTHS,
            initAccounts.ecosystemClaimers
        );

        schedulers[ROLE_TEAM] = new Scheduler(
            tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_TEAM_PERCENT / PRECISION,
            MAX_SUPPLY * ROLE_TEAM_TGEUNLOCK_PERCENT / PRECISION,
            ROLE_TEAM_CLIFF_MONTHS,
            ROLE_TEAM_RELEASE_MONTHS,
            initAccounts.teamClaimers
        );

        schedulers[ROLE_TREASURY] = new Scheduler(
            tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_TREASURY_PERCENT / PRECISION,
            MAX_SUPPLY * ROLE_TREASURY_TGEUNLOCK_PERCENT / PRECISION,
            ROLE_TREASURY_CLIFF_MONTHS,
            ROLE_TREASURY_RELEASE_MONTHS,
            initAccounts.treasuryClaimers
        );

        schedulers[ROLE_ADVISORS] = new Scheduler(
            tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_ADVISORS_PERCENT / PRECISION,
            MAX_SUPPLY * ROLE_ADVISORS_TGEUNLOCK_PERCENT / PRECISION,
            ROLE_ADVISORS_CLIFF_MONTHS,
            ROLE_ADVISORS_RELEASE_MONTHS,
            initAccounts.advisorsClaimers
        );

        schedulers[ROLE_BN_IDO] = new Scheduler(
            tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_BN_IDO_PERCENT / PRECISION,
            MAX_SUPPLY * ROLE_BN_IDO_TGEUNLOCK_PERCENT / PRECISION,
            ROLE_BN_IDO_CLIFF_MONTHS,
            ROLE_BN_IDO_RELEASE_MONTHS,
            initAccounts.bnIdoClaimers
        );

        schedulers[ROLE_MARKETING] = new MarketingScheduler(
            tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_MARKETING_PERCENT / PRECISION,
            MAX_SUPPLY * ROLE_MARKETING_TGEUNLOCK_PERCENT / PRECISION,
            ROLE_MARKETING_CLIFF_MONTHS,
            ROLE_MARKETING_RELEASE_MONTHS,
            initAccounts.marketingClaimers
        );

        schedulers[ROLE_LISTING] = new Scheduler(
            tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_LISTING_PERCENT / PRECISION,
            MAX_SUPPLY * ROLE_LISTING_TGEUNLOCK_PERCENT / PRECISION,
            ROLE_LISTING_CLIFF_MONTHS,
            ROLE_LISTING_RELEASE_MONTHS,
            initAccounts.listingClaimers
        );

        schedulers[ROLE_LIQUIDITY] = new Scheduler(
            tgeAt,
            address(this),
            MAX_SUPPLY * ROLE_LIQUIDITY_PERCENT / PRECISION,
            MAX_SUPPLY * ROLE_LIQUIDITY_TGEUNLOCK_PERCENT / PRECISION,
            ROLE_LIQUIDITY_CLIFF_MONTHS,
            ROLE_LIQUIDITY_RELEASE_MONTHS,
            initAccounts.liquidityClaimers
        );
    }

    // @dev set the bank token
    // @param _bankToken the bank token address
    function setBankToken(address _bankToken) external onlyOwner {
        bankToken = _bankToken;
        emit BankTokenSet(_bankToken);
    }

    // @dev the claimers first check the pending amount from the scheduler contract,
    // then call this function to claim the amount
    // @param role the role of the claimer
    // @param to the address to claim the amount to
    // @param amount the amount to claim, should be less than or equal to the pending amount
    function claim(bytes32 role, address to, uint256 amount) external {
        IScheduler scheduler = schedulers[role];
        require(address(scheduler) != address(0), "Invalid role");
        require(!pausedRoles[role], "Role is paused");
        require(to != address(0), "to address is 0");
        require(amount > 0, "amount is 0");

        scheduler.claim(msg.sender, to, amount);
        (bool success, bytes memory data) = bankToken.call(
            abi.encodeWithSignature(
                "mint(address,uint256)",
                to,
                amount
        ));
        require(success, string(data));
    }

    // @dev pause or unpause the role, no more claim
    // @param role the role to pause
    // @param paused true to pause, false to unpause
    function pauseRole(bytes32 role, bool paused) external onlyOwner {
        require(pausedRoles[role] != paused, "state not changed");
        pausedRoles[role] = paused;
        emit RolePaused(role, paused);
    }
}
