// deploy/deploy.ts
import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying RemittanceOffRamp to Morph Testnet...");

  const OffRamp = await ethers.getContractFactory("RemittanceOffRamp");
  const offRamp = await OffRamp.deploy();

  await offRamp.waitForDeployment();
  const address = await offRamp.getAddress();

  console.log("✅ RemittanceOffRamp deployed to:", address);

  console.log("\n📌 Add to frontend .env.local:");
  console.log(`NEXT_PUBLIC_OFFRAMP_ADDRESS="${address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("🚨 Deployment failed:", error);
    process.exit(1);
  });