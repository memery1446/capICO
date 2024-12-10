// scripts/demo-deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer, investor1, investor2] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Token
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("Test Token", "TEST", "1000000");
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Get current timestamp and add some buffer
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const startTime = currentTimestamp + 120;    // Starts in 2 minutes
  const endTime = startTime + (10 * 60);       // Runs for 10 minutes

  const CapICO = await ethers.getContractFactory("CapICO");
  const capico = await CapICO.deploy(
    token.address,
    ethers.utils.parseEther("0.001"), // Token price: 0.001 ETH
    ethers.utils.parseEther("0.5"),   // Soft cap: 0.5 ETH
    ethers.utils.parseEther("2"),     // Hard cap: 2 ETH
    ethers.utils.parseEther("0.1"),   // Min investment: 0.1 ETH
    ethers.utils.parseEther("1"),     // Max investment: 1 ETH
    startTime,
    endTime
  );

  await capico.deployed();
  console.log("CapICO deployed to:", capico.address);

  // Transfer tokens to the ICO contract
  const transferAmount = ethers.utils.parseEther("10000"); // 10,000 tokens
  await token.transfer(capico.address, transferAmount);
  console.log("Transferred tokens to CapICO contract");

  // Whitelist test accounts
  await capico.updateWhitelist([investor1.address, investor2.address], true);
  console.log("Whitelisted test accounts:", investor1.address, investor2.address);

  console.log("\nDemo Setup Complete!");
  console.log("------------------------");
  console.log("Token Address:", token.address);
  console.log("CapICO Address:", capico.address);
  console.log("ICO Starts:", new Date(startTime * 1000).toLocaleString());
  console.log("ICO Ends:", new Date(endTime * 1000).toLocaleString());
  console.log("Test Accounts Whitelisted:", [investor1.address, investor2.address]);
  console.log("\nTest Values:");
  console.log("------------------------");
  console.log("Token Price:", ethers.utils.formatEther(ethers.utils.parseEther("0.001")), "ETH");
  console.log("Min Investment:", ethers.utils.formatEther(ethers.utils.parseEther("0.1")), "ETH");
  console.log("Max Investment:", ethers.utils.formatEther(ethers.utils.parseEther("1")), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  