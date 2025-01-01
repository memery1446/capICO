// scripts/deploy.js
const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');
const path = require('path');

async function main() {
  // Print start time
  const startBlock = await ethers.provider.getBlock('latest');
  console.log("\nStarting deployment at:", new Date(startBlock.timestamp * 1000).toLocaleString());

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Token
  console.log("\nDeploying Token...");
  const Token = await ethers.getContractFactory("ICOToken");
  const token = await Token.deploy(
    "Demo Token",    // name
    "DEMO",         // symbol
    1000000         // 1 million tokens initial supply
  );
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Get fresh block for timing
  const latestBlock = await ethers.provider.getBlock('latest');
  console.log("\nCurrent block time:", new Date(latestBlock.timestamp * 1000).toLocaleString());
  
  // Set ICO times relative to current block
  const startTime = latestBlock.timestamp + 120;  // Start in 2 minutes
  const duration = 3600;                          // 1 hour duration
  const endTime = startTime + duration;

  console.log("\nSetting ICO times:");
  console.log("Start time:", new Date(startTime * 1000).toLocaleString());
  console.log("End time:", new Date(endTime * 1000).toLocaleString());

  // Deploy ICO
  console.log("\nDeploying ICO...");
  const ICO = await ethers.getContractFactory("CapICO");
  const ico = await ICO.deploy(
    token.address,
    ethers.utils.parseEther("0.001"),       // token price (0.001 ETH)
    ethers.utils.parseEther("100"),         // hard cap (100 ETH)
    startTime,
    endTime
  );
  await ico.deployed();
  console.log("ICO deployed to:", ico.address);

  // Verify the times were set correctly
  const actualStartTime = await ico.startTime();
  const actualEndTime = await ico.endTime();
  
  console.log("\nVerifying deployed times:");
  console.log("Actual start time:", new Date(actualStartTime.toNumber() * 1000).toLocaleString());
  console.log("Actual end time:", new Date(actualEndTime.toNumber() * 1000).toLocaleString());

  // Transfer tokens to ICO contract
  const icoTokens = ethers.utils.parseEther("500000"); // 500k tokens for ICO
  await token.transfer(ico.address, icoTokens);
  console.log("\nTransferred", ethers.utils.formatEther(icoTokens), "tokens to ICO contract");

  // Write contract addresses
  const addressDir = path.join(__dirname, '../src/contracts');
  if (!fs.existsSync(addressDir)) {
    fs.mkdirSync(addressDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(addressDir, 'addresses.js'),
    `export const TOKEN_ADDRESS = "${token.address}";\nexport const ICO_ADDRESS = "${ico.address}";`
  );

  console.log("\nContract addresses written to src/contracts/addresses.js");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  