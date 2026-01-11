import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  // Import ethers from hre
  const { ethers } = hre;
  const networkName = hre.network.name;

  console.log("\n🚀 ═══════════════════════════════════════════════════════");
  console.log("   PREDICT & FUND - Smart Contract Deployment");
  console.log("   Network:", networkName);
  console.log("═══════════════════════════════════════════════════════\n");

  // Get signers
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("📋 Deployment Information:");
  console.log("─────────────────────────────────────────────────────────");
  console.log("  Deployer address:", deployer.address);
  console.log("  Account balance: ", ethers.formatEther(balance), "MNT/ETH");
  console.log("─────────────────────────────────────────────────────────\n");

  // Check balance
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("❌ Insufficient balance! Need at least 0.1 MNT/ETH");
  }

  // ================================================
  // 1. Deploy ProjectRegistry
  // ================================================
  console.log("📦 [1/4] Deploying ProjectRegistry...");
  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const projectRegistry = await ProjectRegistry.deploy();
  await projectRegistry.waitForDeployment();
  
  const projectRegistryAddress = await projectRegistry.getAddress();
  console.log("✅ ProjectRegistry deployed at:", projectRegistryAddress);
  console.log();

  // ================================================
  // 2. Deploy PredictionMarket
  // ================================================
  console.log("📦 [2/4] Deploying PredictionMarket...");
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(projectRegistryAddress);
  await predictionMarket.waitForDeployment();
  
  const predictionMarketAddress = await predictionMarket.getAddress();
  console.log("✅ PredictionMarket deployed at:", predictionMarketAddress);
  console.log();

  // ================================================
  // 3. Deploy FundingPool
  // ================================================
  console.log("📦 [3/4] Deploying FundingPool...");
  const FundingPool = await ethers.getContractFactory("FundingPool");
  const fundingPool = await FundingPool.deploy(
    projectRegistryAddress,
    predictionMarketAddress
  );
  await fundingPool.waitForDeployment();
  
  const fundingPoolAddress = await fundingPool.getAddress();
  console.log("✅ FundingPool deployed at:", fundingPoolAddress);
  console.log();

  // ================================================
  // 4. Deploy ReputationNFT
  // ================================================
  console.log("📦 [4/4] Deploying ReputationNFT...");
  const ReputationNFT = await ethers.getContractFactory("ReputationNFT");
  const reputationNFT = await ReputationNFT.deploy(predictionMarketAddress);
  await reputationNFT.waitForDeployment();
  
  const reputationNFTAddress = await reputationNFT.getAddress();
  console.log("✅ ReputationNFT deployed at:", reputationNFTAddress);
  console.log();

  // ================================================
  // Save Deployment Info
  // ================================================
  const deploymentInfo = {
    network: networkName,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contracts: {
      ProjectRegistry: projectRegistryAddress,
      PredictionMarket: predictionMarketAddress,
      FundingPool: fundingPoolAddress,
      ReputationNFT: reputationNFTAddress,
    },
  };

  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${networkName}_${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  fs.writeFileSync(
    path.join(deploymentsDir, `${networkName}_latest.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to:", filename);
  console.log();

  // ================================================
  // Deployment Summary
  // ================================================
  console.log("🎉 ═══════════════════════════════════════════════════════");
  console.log("   DEPLOYMENT COMPLETE!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("\n📋 Contract Addresses:");
  console.log("─────────────────────────────────────────────────────────");
  console.log("  ProjectRegistry:  ", projectRegistryAddress);
  console.log("  PredictionMarket: ", predictionMarketAddress);
  console.log("  FundingPool:      ", fundingPoolAddress);
  console.log("  ReputationNFT:    ", reputationNFTAddress);
  console.log("─────────────────────────────────────────────────────────");

  // Explorer links
  if (networkName === "mantleSepolia") {
    console.log("\n🔗 View on Mantle Sepolia Explorer:");
    console.log("─────────────────────────────────────────────────────────");
    console.log("  ProjectRegistry:   https://explorer.sepolia.mantle.xyz/address/" + projectRegistryAddress);
    console.log("  PredictionMarket:  https://explorer.sepolia.mantle.xyz/address/" + predictionMarketAddress);
    console.log("  FundingPool:       https://explorer.sepolia.mantle.xyz/address/" + fundingPoolAddress);
    console.log("  ReputationNFT:     https://explorer.sepolia.mantle.xyz/address/" + reputationNFTAddress);
  } else if (networkName === "mantleMainnet") {
    console.log("\n🔗 View on Mantle Mainnet Explorer:");
    console.log("─────────────────────────────────────────────────────────");
    console.log("  ProjectRegistry:   https://explorer.mantle.xyz/address/" + projectRegistryAddress);
    console.log("  PredictionMarket:  https://explorer.mantle.xyz/address/" + predictionMarketAddress);
    console.log("  FundingPool:       https://explorer.mantle.xyz/address/" + fundingPoolAddress);
    console.log("  ReputationNFT:     https://explorer.mantle.xyz/address/" + reputationNFTAddress);
  }

  console.log("\n📝 Next Steps:");
  console.log("─────────────────────────────────────────────────────────");
  console.log("  1. Verify contracts on block explorer (optional)");
  console.log("  2. Update frontend with contract addresses");
  console.log("  3. Test your deployment");
  console.log("─────────────────────────────────────────────────────────\n");

  console.log("🔍 Verification Command:");
  console.log("─────────────────────────────────────────────────────────");
  console.log(`npx hardhat verify --network ${networkName} ${projectRegistryAddress}`);
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ═══════════════════════════════════════════════════════");
    console.error("   DEPLOYMENT FAILED!");
    console.error("═══════════════════════════════════════════════════════\n");
    console.error(error);
    process.exit(1);
  });