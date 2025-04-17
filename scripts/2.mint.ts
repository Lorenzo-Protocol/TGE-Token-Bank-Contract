import { ethers } from "hardhat";
import { DeployedContracts } from "./DeployedContracts";

const Contracts = DeployedContracts.MainNet;
const receiver = "0x48C8AC40b6b7f540B8A17D5cb3d6Cb4d0D87fC8f"; // Matt

const main = async () => {
  const TgeContract = await ethers.getContractAt("TgeContract", Contracts.TgeContract);

  const RewardsRole = await TgeContract.ROLE_REWARDS();
  const InvestorsRole = await TgeContract.ROLE_INVESTORS();
  const EcosystemRole = await TgeContract.ROLE_ECOSYSTEM();
  const TeamRole = await TgeContract.ROLE_TEAM();
  const TreasuryRole = await TgeContract.ROLE_TREASURY();
  const MarketingRole = await TgeContract.ROLE_MARKETING();
  const AdvisorsRole = await TgeContract.ROLE_ADVISORS();
  const IDORole = await TgeContract.ROLE_BN_IDO();
  const LiquidityRole = await TgeContract.ROLE_LIQUIDITY();
  const ListingRole = await TgeContract.ROLE_LISTING();

  const roles = [
    RewardsRole,
    InvestorsRole,
    EcosystemRole,
    TeamRole,
    TreasuryRole,
    MarketingRole,
    AdvisorsRole,
    IDORole,
    LiquidityRole,
    ListingRole,
  ];

  let totalAmount = 0n;
  for (const role of roles) {
    const rewardsShedulerAddr = await TgeContract.schedulers(role);
    const rewardsSheduler = await ethers.getContractAt("Scheduler", rewardsShedulerAddr);

    const pendingAmount = await rewardsSheduler.getPendingAmount();
    console.log("pendingAmount", pendingAmount);

    // const tgeAt = await rewardsSheduler.tgeTimestamp();
    // console.log("tgeAt: ", tgeAt);
    // console.log("now  : ", (await ethers.provider.getBlock('latest'))!.timestamp);

    // console.log("bank token: ", await TgeContract.bankToken());
    if (pendingAmount > 0) {
      let tx = await TgeContract.claim(role, receiver, pendingAmount);
      await tx.wait();
      console.log("tx hash: ", tx.hash);
      totalAmount += pendingAmount;
    }
  }

  console.log("totalAmount: ", ethers.formatEther(totalAmount));
}

main();
