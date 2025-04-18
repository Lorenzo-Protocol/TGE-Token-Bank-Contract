import { DeployedContracts } from "./DeployedContracts";
import { ethers } from "hardhat";

const Contracts  = DeployedContracts.MainNet;

const owner = "0xEde6D2301178d364A5b011260694aA6688C3B11a";
const TgeTimestamp = 1744809600; // 2025-04-16 21:20:00 GMT+08:00

const main = async () => {

  const TgeContractV2Impl = await ethers.deployContract("TgeContractV2");
  await TgeContractV2Impl.waitForDeployment();
  console.log("TgeContractV2 deployed to:", TgeContractV2Impl.target);

  const calldata = TgeContractV2Impl.interface.encodeFunctionData("onUpgradeToV2", [
    TgeTimestamp,
    [owner],
    [owner],
    [owner]
  ]);
  console.log("calldata: ", calldata);

  // 实际升级操作需要owner执行
  // const TgeContract = await ethers.getContractAt("TgeContract", Contracts.TgeContract);
  // const tx = await TgeContract.upgradeToAndCall(
  //   TgeContractV2Impl.target,
  //   calldata
  // );
  // await tx.wait();
  // console.log("tx hash: ", tx.hash);
}

main();

