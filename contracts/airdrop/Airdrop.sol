// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop is UUPSUpgradeable, OwnableUpgradeable {

    event RootSet(uint256 indexed roundId, bytes32 root);
    event AirdropClaimed(uint256 indexed roundId, address indexed user, uint256 amount);

    address public bankAddress;
    // mapping airdrop round => merkle root
    mapping(uint256 roundId => bytes32 root) public roots;
    mapping(bytes32 leaf => bool claimed) public claimedAirdrops;

    constructor() {
        _disableInitializers();
    }

    function initialize(address _owner, address _bankAddress) external initializer {
        __Ownable_init(_owner);
        bankAddress = _bankAddress;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // @dev set the merkle root for airdrop round
    // @param roundId the round id
    // @param root the merkle root
    function setRoot(uint256 roundId, bytes32 root) external onlyOwner {
        roots[roundId] = root;
        emit RootSet(roundId, root);
    }

    // @dev claim the airdrop
    // @param roundId the round id
    // @param amount the amount to claim
    // @param proof the proof of the claim
    function airdrop(uint256 roundId, uint256 amount, bytes32[] calldata proof) external {
        require(roots[roundId] != bytes32(0), "root not set");

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(
            block.chainid, roundId, msg.sender, amount
        ))));
        bool verified = MerkleProof.verify(proof, roots[roundId], leaf);
        require(verified, "verify failed");
        require(!claimedAirdrops[leaf], "already claimed");
        claimedAirdrops[leaf] = true;

        SafeERC20.safeTransfer(IERC20(bankAddress), msg.sender, amount);
        emit AirdropClaimed(roundId, msg.sender, amount);
    }
}