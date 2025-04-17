import { ethers } from "hardhat";

const deployer = new ethers.Wallet("0x55a9e36389a676cbf4d443126822a48a3af98fdb42514b6ac68f27a64cf74b63", ethers.provider);

const owner = "0xEde6D2301178d364A5b011260694aA6688C3B11a";
const TgeTimestamp = 1744809600; // 2025-04-16 21:20:00 GMT+08:00

const main = async () => {
  // const now = (await ethers.provider.getBlock('latest'))!.timestamp;

  const tgeContractImpl = await ethers.deployContract("TgeContract");
  await tgeContractImpl.waitForDeployment();

  const data = tgeContractImpl.interface.encodeFunctionData(
    "initialize",
    [
      deployer.address, // owner
      TgeTimestamp,    // tgeTimestamp
      {
        rewardsClaimers: [owner],
        investorsClaimers: [owner],
        ecosystemClaimers: [owner],
        teamClaimers: [owner],
        treasuryClaimers: [owner],
        advisorsClaimers: [owner],
        bnIdoClaimers: [owner],
        marketingClaimers: [owner],
        listingClaimers: [owner],
        liquidityClaimers: [owner],
      },
    ],
  );

  const tgeContractProxy = await ethers.deployContract("ERC1967Proxy", [
    tgeContractImpl.target,
    data,
  ]);
  await tgeContractProxy.waitForDeployment();
  console.log("TgeContract deployed to:", tgeContractProxy.target);

  const TgeContract = await ethers.getContractAt("TgeContract", tgeContractProxy.target);

  const bankToken = await ethers.deployContract("BankToken", [ TgeContract.target ]);
  await bankToken.waitForDeployment();
  console.log("BankToken deployed to:", bankToken.target);

  let tx = await TgeContract.connect(deployer).setBankToken(bankToken.target);
  await tx.wait();
  console.log("set bank token tx hash: ", tx.hash);

  // CAUTION: should transfer ownership to the multisig wallet
  tx = await TgeContract.connect(deployer).transferOwnership(owner);
  await tx.wait();
  console.log("transfer ownership tx hash: ", tx.hash);

  // const airdropImpl = await ethers.deployContract("Airdrop");
  // await airdropImpl.waitForDeployment();

  // const airdropData = airdropImpl.interface.encodeFunctionData(
  //   "initialize",
  //   [
  //     owner.address,
  //     mexicoToken.target,
  //   ],
  // );
  // const airdropProxy = await ethers.deployContract("ERC1967Proxy", [
  //   airdropImpl.target,
  //   airdropData,
  // ]);
  // await airdropProxy.waitForDeployment();

  // console.log("Airdrop deployed to:", airdropProxy.target);

  // const Airdrop = await ethers.getContractAt("Airdrop", airdropProxy.target);
}

main();