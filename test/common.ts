import { ethers } from "hardhat";

const MaxSupply = ethers.parseEther("2100000000"); // 2.1B
const Precision = ethers.parseEther("1");
const ReleaseConfigV1 = {
  rewards: {
    totalPercent: ethers.parseEther("0.25"),
    tgeUnlockPercent: ethers.parseEther("0.08"),
    cliffMonths: 0n,
    releaseMonths: 36n,
  },
  investors: {
    totalPercent: ethers.parseEther("0.25"),
    tgeUnlockPercent: ethers.parseEther("0"),
    cliffMonths: 12n,
    releaseMonths: 48n,
  },
  ecosystem: {
    totalPercent: ethers.parseEther("0.13"),
    tgeUnlockPercent: ethers.parseEther("0.0325"),
    cliffMonths: 12n,
    releaseMonths: 48n,
  },
  team: {
    totalPercent: ethers.parseEther("0.15"),
    tgeUnlockPercent: ethers.parseEther("0"),
    cliffMonths: 12n,
    releaseMonths: 60n,
  },
  treasury: {
    totalPercent: ethers.parseEther("0.05"),
    tgeUnlockPercent: ethers.parseEther("0"),
    cliffMonths: 12n,
    releaseMonths: 48n,
  },
  advisors: {
    totalPercent: ethers.parseEther("0.05"),
    tgeUnlockPercent: ethers.parseEther("0"),
    cliffMonths: 12n,
    releaseMonths: 60n,
  },
  bnIdo: {
    totalPercent: ethers.parseEther("0.02"),
    tgeUnlockPercent: ethers.parseEther("0.02"),
    cliffMonths: 0n,
    releaseMonths: 0n,
  },
  marketing: {
    totalPercent: ethers.parseEther("0.03"),
    tgeUnlockPercent: ethers.parseEther("0"),
    cliffMonths: 0n,
    releaseMonths: 6n,
  },
  listing: {
    totalPercent: ethers.parseEther("0.03"),
    tgeUnlockPercent: ethers.parseEther("0.03"),
    cliffMonths: 0n,
    releaseMonths: 0n,
  },
  liquidity: {
    totalPercent: ethers.parseEther("0.04"),
    tgeUnlockPercent: ethers.parseEther("0.04"),
    cliffMonths: 0n,
    releaseMonths: 0n,
  },
};

const ReleaseConfigV2 = {
  investors: {
    totalPercent: ethers.parseEther("0.25"),
    tgeUnlockPercent: ethers.parseEther("0"),
    cliffMonths: 12n,
    releaseMonths: 36n,
  },

  team: {
    totalPercent: ethers.parseEther("0.15"),
    tgeUnlockPercent: ethers.parseEther("0"),
    cliffMonths: 12n,
    releaseMonths: 48n,
  },

  advisors: {
    totalPercent: ethers.parseEther("0.05"),
    tgeUnlockPercent: ethers.parseEther("0"),
    cliffMonths: 12n,
    releaseMonths: 48n,
  }
};

export async function deployBank() {
  const [owner, rewardClaimer, investorClaimer, ecosystemClaimer, teamClaimer, treasuryClaimer, advisorClaimer, bnClaimer, liquidityClaimer, player1] = await ethers.getSigners();
  const now = (await ethers.provider.getBlock('latest'))!.timestamp;

  const tgeContractImpl = await ethers.deployContract("TgeContract");
  await tgeContractImpl.waitForDeployment();

  const data = tgeContractImpl.interface.encodeFunctionData(
    "initialize",
    [
      owner.address,
      now + 10,
      {
        rewardsClaimers: [rewardClaimer.address],
        investorsClaimers: [investorClaimer.address],
        ecosystemClaimers: [ecosystemClaimer.address],
        teamClaimers: [teamClaimer.address],
        treasuryClaimers: [treasuryClaimer.address],
        advisorsClaimers: [advisorClaimer.address],
        bnIdoClaimers: [bnClaimer.address],
        marketingClaimers: [bnClaimer.address],
        listingClaimers: [bnClaimer.address],
        liquidityClaimers: [liquidityClaimer.address],
      },
    ],
  );

  const tgeContractProxy = await ethers.deployContract("ERC1967Proxy", [
    tgeContractImpl.target,
    data,
  ]);
  await tgeContractProxy.waitForDeployment();

  const TgeContract = await ethers.getContractAt("TgeContract", tgeContractProxy.target);

  const bank = await ethers.deployContract("BankToken", [ TgeContract.target ]);
  await bank.waitForDeployment();

  await TgeContract.connect(owner).setBankToken(bank.target);

  const airdropImpl = await ethers.deployContract("Airdrop");
  await airdropImpl.waitForDeployment();

  const airdropData = airdropImpl.interface.encodeFunctionData(
    "initialize",
    [
      owner.address,
      bank.target,
    ],
  );
  const airdropProxy = await ethers.deployContract("ERC1967Proxy", [
    airdropImpl.target,
    airdropData,
  ]);
  await airdropProxy.waitForDeployment();

  const Airdrop = await ethers.getContractAt("Airdrop", airdropProxy.target);

  return { TgeContract, ReleaseConfigV1, ReleaseConfigV2, MaxSupply, Precision, bank, rewardClaimer, investorClaimer, ecosystemClaimer, teamClaimer, treasuryClaimer, advisorClaimer, bnClaimer, liquidityClaimer, Airdrop, player1, owner };
}