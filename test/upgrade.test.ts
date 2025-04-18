import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployBank } from "./common";
describe("Upgrade TgeContract", function () {
  async function getRewardsScheduler(tgeContract: any, role: string) {
    // const rewardsRole = await tgeContract.ROLE_REWARDS();
    const schedulerAddress = await tgeContract.schedulers(role);
    const scheduler = await ethers.getContractAt("Scheduler", schedulerAddress);
    return scheduler;
  }

  it("upgrade checking", async function () {
    const { bank, investorClaimer, teamClaimer, advisorClaimer, ReleaseConfigV1, ReleaseConfigV2, MaxSupply, Precision, TgeContract, owner } = await loadFixture(deployBank);

    const InvestorsRole = await TgeContract.ROLE_INVESTORS();
    const TeamRole = await TgeContract.ROLE_TEAM();
    const AdvisorsRole = await TgeContract.ROLE_ADVISORS();

    let schedulerInvestorsV1 = await getRewardsScheduler(TgeContract, InvestorsRole);
    let schedulerTeamV1 = await getRewardsScheduler(TgeContract, TeamRole);
    let schedulerAdvisorsV1 = await getRewardsScheduler(TgeContract, AdvisorsRole);

    // check the setting of v1
    expect(await schedulerInvestorsV1.cliffMonths()).to.equal(ReleaseConfigV1.investors.cliffMonths);
    expect(await schedulerInvestorsV1.releaseMonths()).to.equal(ReleaseConfigV1.investors.releaseMonths);
    expect(await schedulerInvestorsV1.totalGrantAmount()).to.equal(ReleaseConfigV1.investors.totalPercent * MaxSupply / Precision);
    expect(await schedulerInvestorsV1.tgeUnlockAmount()).to.equal(ReleaseConfigV1.investors.tgeUnlockPercent * MaxSupply / Precision);
    expect(await schedulerInvestorsV1.monthlyReleaseAmount()).to.equal(ReleaseConfigV1.investors.totalPercent * MaxSupply / Precision / ReleaseConfigV1.investors.releaseMonths);

    expect(await schedulerTeamV1.cliffMonths()).to.equal(ReleaseConfigV1.team.cliffMonths);
    expect(await schedulerTeamV1.releaseMonths()).to.equal(ReleaseConfigV1.team.releaseMonths);
    expect(await schedulerTeamV1.totalGrantAmount()).to.equal(ReleaseConfigV1.team.totalPercent * MaxSupply / Precision);
    expect(await schedulerTeamV1.tgeUnlockAmount()).to.equal(ReleaseConfigV1.team.tgeUnlockPercent * MaxSupply / Precision);
    expect(await schedulerTeamV1.monthlyReleaseAmount()).to.equal(ReleaseConfigV1.team.totalPercent * MaxSupply / Precision / ReleaseConfigV1.team.releaseMonths);

    expect(await schedulerAdvisorsV1.cliffMonths()).to.equal(ReleaseConfigV1.advisors.cliffMonths);
    expect(await schedulerAdvisorsV1.releaseMonths()).to.equal(ReleaseConfigV1.advisors.releaseMonths);
    expect(await schedulerAdvisorsV1.totalGrantAmount()).to.equal(ReleaseConfigV1.advisors.totalPercent * MaxSupply / Precision);
    expect(await schedulerAdvisorsV1.tgeUnlockAmount()).to.equal(ReleaseConfigV1.advisors.tgeUnlockPercent * MaxSupply / Precision);
    expect(await schedulerAdvisorsV1.monthlyReleaseAmount()).to.equal(ReleaseConfigV1.advisors.totalPercent * MaxSupply / Precision / ReleaseConfigV1.advisors.releaseMonths);


    await time.increase(86400n);
    // upgrade to v2
    const tgeV2 = await ethers.deployContract("TgeContractV2");
    await tgeV2.waitForDeployment();
    const TgeTimestamp = await schedulerAdvisorsV1.tgeTimestamp();

    const calldata = tgeV2.interface.encodeFunctionData("onUpgradeToV2", [
      TgeTimestamp,
      [investorClaimer.address],
      [teamClaimer.address],
      [advisorClaimer.address]
    ]);
   console.log("calldata: ", calldata);

    const tx = await TgeContract.upgradeToAndCall(
      tgeV2.target,
      calldata
    );
    await tx.wait();
    console.log("tx hash: ", tx.hash);

    // check the setting of v2
    let schedulerInvestorsV2 = await getRewardsScheduler(TgeContract, InvestorsRole);
    let schedulerTeamV2 = await getRewardsScheduler(TgeContract, TeamRole);
    let schedulerAdvisorsV2 = await getRewardsScheduler(TgeContract, AdvisorsRole);

    expect(await schedulerInvestorsV2.cliffMonths()).to.equal(ReleaseConfigV2.investors.cliffMonths);
    expect(await schedulerInvestorsV2.releaseMonths()).to.equal(ReleaseConfigV2.investors.releaseMonths);
    expect(await schedulerInvestorsV2.totalGrantAmount()).to.equal(ReleaseConfigV2.investors.totalPercent * MaxSupply / Precision);
    expect(await schedulerInvestorsV2.tgeUnlockAmount()).to.equal(ReleaseConfigV2.investors.tgeUnlockPercent * MaxSupply / Precision);
    expect(await schedulerInvestorsV2.monthlyReleaseAmount()).to.equal(ReleaseConfigV2.investors.totalPercent * MaxSupply / Precision / ReleaseConfigV2.investors.releaseMonths);

    expect(await schedulerTeamV2.cliffMonths()).to.equal(ReleaseConfigV2.team.cliffMonths);
    expect(await schedulerTeamV2.releaseMonths()).to.equal(ReleaseConfigV2.team.releaseMonths);
    expect(await schedulerTeamV2.totalGrantAmount()).to.equal(ReleaseConfigV2.team.totalPercent * MaxSupply / Precision);
    expect(await schedulerTeamV2.tgeUnlockAmount()).to.equal(ReleaseConfigV2.team.tgeUnlockPercent * MaxSupply / Precision);
    expect(await schedulerTeamV2.monthlyReleaseAmount()).to.equal(ReleaseConfigV2.team.totalPercent * MaxSupply / Precision / ReleaseConfigV2.team.releaseMonths);

    expect(await schedulerAdvisorsV2.cliffMonths()).to.equal(ReleaseConfigV2.advisors.cliffMonths);
    expect(await schedulerAdvisorsV2.releaseMonths()).to.equal(ReleaseConfigV2.advisors.releaseMonths);
    expect(await schedulerAdvisorsV2.totalGrantAmount()).to.equal(ReleaseConfigV2.advisors.totalPercent * MaxSupply / Precision);
    expect(await schedulerAdvisorsV2.tgeUnlockAmount()).to.equal(ReleaseConfigV2.advisors.tgeUnlockPercent * MaxSupply / Precision);
    expect(await schedulerAdvisorsV2.monthlyReleaseAmount()).to.equal(ReleaseConfigV2.advisors.totalPercent * MaxSupply / Precision / ReleaseConfigV2.advisors.releaseMonths);

    expect(await schedulerInvestorsV2.tgeTimestamp()).to.equal(TgeTimestamp);
    expect(await schedulerTeamV2.tgeTimestamp()).to.equal(TgeTimestamp);
    expect(await schedulerAdvisorsV2.tgeTimestamp()).to.equal(TgeTimestamp);

    expect(await schedulerInvestorsV2.tgeContract()).to.equal(TgeContract.target);
    expect(await schedulerTeamV2.tgeContract()).to.equal(TgeContract.target);
    expect(await schedulerAdvisorsV2.tgeContract()).to.equal(TgeContract.target);

    // check constant address
    expect(schedulerAdvisorsV1.target).to.not.equal(schedulerAdvisorsV2.target);
    expect(schedulerInvestorsV1.target).to.not.equal(schedulerInvestorsV2.target);
    expect(schedulerTeamV1.target).to.not.equal(schedulerTeamV2.target);

    expect(await TgeContract.owner()).to.equal(owner.address);

    await expect(
      TgeContract.connect(investorClaimer).claim(InvestorsRole, investorClaimer.address, 1000000000000000000n)
    ).to.be.revertedWith("Not enough pending amount");

    await expect(
      TgeContract.connect(teamClaimer).claim(TeamRole, teamClaimer.address, 1000000000000000000n)
    ).to.be.revertedWith("Not enough pending amount");

    await expect(
      TgeContract.connect(advisorClaimer).claim(AdvisorsRole, advisorClaimer.address, 1000000000000000000n)
    ).to.be.revertedWith("Not enough pending amount");

    await time.increase(86400n * 365n + 86400n * 30n);

    const investorPendingAmount = await schedulerInvestorsV2.getPendingAmount();
    const teamPendingAmount = await schedulerTeamV2.getPendingAmount();
    const advisorsPendingAmount = await schedulerAdvisorsV2.getPendingAmount();

    expect(investorPendingAmount).to.equal(await schedulerInvestorsV2.monthlyReleaseAmount());
    expect(teamPendingAmount).to.equal(await schedulerTeamV2.monthlyReleaseAmount());
    expect(advisorsPendingAmount).to.equal(await schedulerAdvisorsV2.monthlyReleaseAmount());

    await TgeContract.connect(investorClaimer).claim(InvestorsRole, investorClaimer.address, investorPendingAmount);
    await TgeContract.connect(teamClaimer).claim(TeamRole, teamClaimer.address, teamPendingAmount);
    await TgeContract.connect(advisorClaimer).claim(AdvisorsRole, advisorClaimer.address, advisorsPendingAmount);
  });
});
