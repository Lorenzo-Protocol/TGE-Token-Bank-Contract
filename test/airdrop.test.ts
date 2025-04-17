import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployBank } from "./common";


describe("Airdrop", function () {
  async function getLiquidityScheduler(tgeContract: any) {
    const liquidityRole = await tgeContract.ROLE_LIQUIDITY();
    const schedulerAddress = await tgeContract.schedulers(liquidityRole);
    const scheduler = await ethers.getContractAt("Scheduler", schedulerAddress);
    return scheduler;
  }

  it("airdrop", async function () {
    const { Airdrop, TgeContract, liquidityClaimer, bank, player1, owner } = await loadFixture(deployBank);
    const LiquidityRole = await TgeContract.ROLE_LIQUIDITY();
    await time.increase(120n);

    const airdropAmount = ethers.parseEther("1000");
    await TgeContract.connect(liquidityClaimer).claim(LiquidityRole, Airdrop.target, airdropAmount);
    expect(await bank.balanceOf(Airdrop.target)).to.equal(airdropAmount);
    expect(await bank.totalSupply()).to.equal(airdropAmount);

    const player1AirdropAmount = ethers.parseEther("300");
    const ownerAirdropAmount = ethers.parseEther("200");
    const roundId = 1;
    const merkleValue = [
      [roundId, player1.address, player1AirdropAmount],
      [roundId, owner.address, ownerAirdropAmount],
    ];

    const merkleTree = StandardMerkleTree.of(merkleValue, ["uint256", "address", "uint256"]);
    const player1Proof = merkleTree.getProof(0);

    await expect(
      Airdrop.connect(player1).airdrop(roundId, player1AirdropAmount, player1Proof)
    ).to.be.revertedWith("root not set");
    await Airdrop.connect(owner).setRoot(roundId, merkleTree.root);
    await Airdrop.connect(player1).airdrop(roundId, player1AirdropAmount, player1Proof);
    expect(await bank.balanceOf(player1.address)).to.equal(player1AirdropAmount);
    await expect(
      Airdrop.connect(player1).airdrop(roundId, player1AirdropAmount, player1Proof)
    ).to.be.revertedWith("already claimed");

    const ownerProof = merkleTree.getProof(1);
    await Airdrop.connect(owner).airdrop(roundId, ownerAirdropAmount, ownerProof);
    expect(await bank.balanceOf(owner.address)).to.equal(ownerAirdropAmount);

    expect(await bank.balanceOf(Airdrop.target)).to.equal(
      airdropAmount - player1AirdropAmount - ownerAirdropAmount
    );
  });
});
