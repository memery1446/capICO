const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

  // Get current timestamp and add a small buffer
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Force Hardhat to use our timestamp
  await network.provider.send("evm_setNextBlockTimestamp", [currentTime]);
  await network.provider.send("evm_mine");

  // Deploy Token
  const Token = await ethers.getContractFactory("Token");
  const initialSupply = 1000000; // 1 million tokens
  const token = await Token.deploy("MyToken", "MTK", initialSupply);
  await token.deployed();
  console.log("\nToken deployed to:", token.address);

  // Set up ICO parameters
  const tokenPrice = ethers.utils.parseEther("0.001"); // 0.001 ETH per token
  const softCap = ethers.utils.parseEther("50");       // 50 ETH
  const hardCap = ethers.utils.parseEther("200");      // 200 ETH
  const minInvestment = ethers.utils.parseEther("0.1"); // 0.1 ETH
  const maxInvestment = ethers.utils.parseEther("10");  // 10 ETH

  // Set ICO times
  const startTime = currentTime + 30;  // Start in 30 seconds
  const duration = 3600;               // 1 hour duration
  const endTime = startTime + duration;

  // Deploy CapICO
  const CapICO = await ethers.getContractFactory("CapICO");
  const capICO = await CapICO.deploy(
    token.address,
    tokenPrice,
    softCap,
    hardCap,
    minInvestment,
    maxInvestment,
    startTime,
    endTime
  );
  await capICO.deployed();

  // Transfer tokens to CapICO contract
  const icoTokens = ethers.utils.parseEther("200000"); // 200,000 tokens for ICO
  await token.transfer(capICO.address, icoTokens);

  // Set short cooldown for demo
  await token.setDemoTransferCooldown(120); // 2 minutes cooldown

  // Verify deployment
  console.log("\nDeployment Verification:");
  console.log("Token Address:", token.address);
  console.log("CapICO Address:", capICO.address);
  
  console.log("\nTimeline Verification:");
  console.log("Current Time:", new Date(currentTime * 1000).toLocaleString());
  console.log("Start Time: ", new Date(startTime * 1000).toLocaleString());
  console.log("End Time:   ", new Date(endTime * 1000).toLocaleString());

  // Update constants.js with new addresses
  const constantsPath = path.join(__dirname, '../src/utils/constants.js');
  const constants = `export const CAPICO_ADDRESS = "${capICO.address}";
export const TOKEN_ADDRESS = "${token.address}";

// Rest of your constants file...
`;

  fs.writeFileSync(constantsPath, constants, { flag: 'w' });
  console.log("\nUpdated contract addresses in constants.js");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });