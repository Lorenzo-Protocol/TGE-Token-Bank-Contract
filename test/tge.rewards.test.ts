import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployBank } from "./common";

describe("Rewards Release", function () {
  async function getRewardsScheduler(tgeContract: any) {
    const rewardsRole = await tgeContract.ROLE_REWARDS();
    const schedulerAddress = await tgeContract.schedulers(rewardsRole);
    const scheduler = await ethers.getContractAt("Scheduler", schedulerAddress);
    return scheduler;
  }

  it("total check settings", async function () {
    const { bank, rewardClaimer, ReleaseConfig, MaxSupply, Precision, TgeContract } = await loadFixture(deployBank);
    const scheduler = await getRewardsScheduler(TgeContract);

    const totalGrantAmount = ReleaseConfig.rewards.totalPercent * MaxSupply / Precision;
    const tgeUnlockAmount = ReleaseConfig.rewards.tgeUnlockPercent * MaxSupply / Precision;
    const monthlyReleaseAmount = (totalGrantAmount - tgeUnlockAmount) / ReleaseConfig.rewards.releaseMonths;
    expect(await scheduler.claimers(rewardClaimer.address)).to.equal(true);
    expect(await scheduler.totalGrantAmount()).to.equal(totalGrantAmount);
    expect(await scheduler.tgeUnlockAmount()).to.equal(tgeUnlockAmount);
    expect(await scheduler.cliffMonths()).to.equal(ReleaseConfig.rewards.cliffMonths);
    expect(await scheduler.releaseMonths()).to.equal(ReleaseConfig.rewards.releaseMonths);
    expect(await scheduler.monthlyReleaseAmount()).to.equal(monthlyReleaseAmount);
  });

  it("claim", async function () {
    const { bank,rewardClaimer, ReleaseConfig, MaxSupply, Precision, TgeContract } = await loadFixture(deployBank);
    const ROLE = await TgeContract.ROLE_REWARDS();
    const scheduler = await getRewardsScheduler(TgeContract);
    let pending = await scheduler.getPendingAmount();

    // to check tge unlock amount
    const tgeUnlockAmount = ReleaseConfig.rewards.tgeUnlockPercent * MaxSupply / Precision;
    expect(pending).to.equal(tgeUnlockAmount);
    await expect(TgeContract.connect(rewardClaimer).claim(ROLE, rewardClaimer.address, pending+1n)).to.be.revertedWith("Not enough pending amount");
    // cross cliff months, no reward to claim
    await time.increase(ReleaseConfig.rewards.cliffMonths * 30n * 86400n + 1n);
    pending = await scheduler.getPendingAmount();
    expect(pending).to.equal(tgeUnlockAmount);

    // pass to next month, should claim monthly release amount
    const monthlyReleaseAmount = await scheduler.monthlyReleaseAmount();
    await time.increase(86400n * 30n + 11n);
    pending = await scheduler.getPendingAmount();
    expect(pending).to.equal(monthlyReleaseAmount + tgeUnlockAmount);
    await TgeContract.connect(rewardClaimer).claim(ROLE, rewardClaimer.address, monthlyReleaseAmount);
    expect(await bank.balanceOf(rewardClaimer.address)).to.equal(monthlyReleaseAmount);
    expect(await scheduler.totalClaimedAmount()).to.equal(monthlyReleaseAmount);
    // pass to next month, should claim monthly release amount
    await time.increase(86400n * 30n * 2n);
    pending = await scheduler.getPendingAmount();
    expect(pending).to.equal(monthlyReleaseAmount * 2n + tgeUnlockAmount);

    const releaseMonths = await scheduler.releaseMonths();
    await time.increase(86400n * 30n * (releaseMonths - 3n));
    const finalPending = await scheduler.getPendingAmount();
    expect(finalPending).to.equal(monthlyReleaseAmount * (releaseMonths - 1n) + tgeUnlockAmount);

    // wait for another 3 months, but pending rewards should keep same
    await time.increase(86400n * 30n * 3n);
    pending = await scheduler.getPendingAmount();
    expect(pending).to.equal(finalPending);

    await TgeContract.connect(rewardClaimer).claim(ROLE, rewardClaimer.address, pending);
    expect(await scheduler.totalGrantAmount() - (await bank.balanceOf(rewardClaimer.address))).to.lte(100n);
    expect(await scheduler.totalClaimedAmount() - await scheduler.totalGrantAmount()).to.lte(100n);
  });
});
