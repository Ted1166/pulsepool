import { ethers } from "ethers";
import hre from "hardhat";
import fs from "fs";
import path from "path";

// ========================================
// Configuration: Set what to deploy
// ========================================
const DEPLOY_MODE = process.env.DEPLOY_MODE || "all"; // "all" or "predictionmarket"

async function main() {
  const networkName = hre.network.name || "mantleSepolia";
  const rpcUrl = process.env.MANTLE_SEPOLIA_RPC || "https://rpc.sepolia.mantle.xyz";

  console.log("\n🚀 ═══════════════════════════════════════════════════════");
  console.log(`   SMART CONTRACT DEPLOYMENT - ${DEPLOY_MODE.toUpperCase()} MODE`);
  console.log("   Network:", networkName);
  console.log("═══════════════════════════════════════════════════════\n");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  console.log("📋 Deployment Information:");
  console.log("─────────────────────────────────────────────────────────");
  console.log("  Deployer address:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("  Account balance: ", ethers.formatEther(balance), "MNT");
  console.log("─────────────────────────────────────────────────────────\n");

  if (balance < ethers.parseEther("0.1")) {
    throw new Error("❌ Insufficient balance! Need at least 0.1 MNT");
  }

  let deploymentInfo: any = {
    network: networkName,
    deployer: wallet.address,
    deploymentTime: new Date().toISOString(),
    contracts: {},
  };

  // ================================================
  // PREDICTION MARKET ONLY MODE
  // ================================================
  if (DEPLOY_MODE === "predictionmarket") {
    console.log("📦 [1/1] Deploying PredictionMarket...");
    const PredictionMarketArtifact = await hre.artifacts.readArtifact("PredictionMarket");
    const PredictionMarketFactory = new ethers.ContractFactory(
      PredictionMarketArtifact.abi,
      PredictionMarketArtifact.bytecode,
      wallet
    );
    const predictionMarket = await PredictionMarketFactory.deploy();
    await predictionMarket.waitForDeployment();
    const predictionMarketAddress = await predictionMarket.getAddress();
    console.log("✅ PredictionMarket deployed at:", predictionMarketAddress);
    console.log();

    deploymentInfo.contracts.PredictionMarket = predictionMarketAddress;
  } 
  
  // ================================================
  // FULL DEPLOYMENT MODE
  // ================================================
  else {
    // 1. Deploy ProjectRegistry
    console.log("📦 [1/4] Deploying ProjectRegistry...");
    const ProjectRegistryArtifact = await hre.artifacts.readArtifact("ProjectRegistry");
    const ProjectRegistryFactory = new ethers.ContractFactory(
      ProjectRegistryArtifact.abi,
      ProjectRegistryArtifact.bytecode,
      wallet
    );
    const projectRegistry = await ProjectRegistryFactory.deploy();
    await projectRegistry.waitForDeployment();
    const projectRegistryAddress = await projectRegistry.getAddress();
    console.log("✅ ProjectRegistry deployed at:", projectRegistryAddress);
    console.log();

    // 2. Deploy PredictionMarket
    console.log("📦 [2/4] Deploying PredictionMarket...");
    const PredictionMarketArtifact = await hre.artifacts.readArtifact("PredictionMarket");
    const PredictionMarketFactory = new ethers.ContractFactory(
      PredictionMarketArtifact.abi,
      PredictionMarketArtifact.bytecode,
      wallet
    );
    const predictionMarket = await PredictionMarketFactory.deploy();
    await predictionMarket.waitForDeployment();
    const predictionMarketAddress = await predictionMarket.getAddress();
    console.log("✅ PredictionMarket deployed at:", predictionMarketAddress);
    console.log();

    // 3. Deploy FundingPool
    console.log("📦 [3/4] Deploying FundingPool...");
    const FundingPoolArtifact = await hre.artifacts.readArtifact("FundingPool");
    const FundingPoolFactory = new ethers.ContractFactory(
      FundingPoolArtifact.abi,
      FundingPoolArtifact.bytecode,
      wallet
    );
    const fundingPool = await FundingPoolFactory.deploy(
      projectRegistryAddress,
      predictionMarketAddress
    );
    await fundingPool.waitForDeployment();
    const fundingPoolAddress = await fundingPool.getAddress();
    console.log("✅ FundingPool deployed at:", fundingPoolAddress);
    console.log();

    // 4. Deploy ReputationNFT
    console.log("📦 [4/4] Deploying ReputationNFT...");
    const ReputationNFTArtifact = await hre.artifacts.readArtifact("ReputationNFT");
    const ReputationNFTFactory = new ethers.ContractFactory(
      ReputationNFTArtifact.abi,
      ReputationNFTArtifact.bytecode,
      wallet
    );
    const reputationNFT = await ReputationNFTFactory.deploy(predictionMarketAddress);
    await reputationNFT.waitForDeployment();
    const reputationNFTAddress = await reputationNFT.getAddress();
    console.log("✅ ReputationNFT deployed at:", reputationNFTAddress);
    console.log();

    deploymentInfo.contracts = {
      ProjectRegistry: projectRegistryAddress,
      PredictionMarket: predictionMarketAddress,
      FundingPool: fundingPoolAddress,
      ReputationNFT: reputationNFTAddress,
    };
  }

  // ================================================
  // Save Deployment Info
  // ================================================
  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const mode = DEPLOY_MODE === "predictionmarket" ? "predictionmarket" : "full";
  const filename = `${mode}_${networkName}_${Date.now()}.json`;
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
  
  Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
    console.log(`  ${name.padEnd(18)}: ${address}`);
  });
  
  console.log("─────────────────────────────────────────────────────────");

  console.log("\n🔗 View on Mantle Sepolia Explorer:");
  console.log("─────────────────────────────────────────────────────────");
  Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
    console.log(`  ${name}: https://explorer.sepolia.mantle.xyz/address/${address}`);
  });

  console.log("\n📝 Next Steps:");
  console.log("─────────────────────────────────────────────────────────");
  console.log("  1. Update frontend contracts.ts with these addresses");
  console.log("  2. Test your deployment");
  console.log("─────────────────────────────────────────────────────────\n");
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