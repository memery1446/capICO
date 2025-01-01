// scripts/deploy.js
const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("\nDeploying contracts with account:", deployer.address);

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

  // Get current time for ICO timing
  const currentTime = Math.floor(Date.now() / 1000);
  const startTime = currentTime + 60;    // Start in 1 minute
  const duration = 3600;                 // 1 hour duration
  const endTime = startTime + duration;

  // Deploy ICO with reasonable test values
  console.log("\nDeploying ICO...");
  const ICO = await ethers.getContractFactory("CapICO");
  const ico = await ICO.deploy(
    token.address,                           // token address
    ethers.utils.parseEther("0.001"),       // token price (0.001 ETH)
    ethers.utils.parseEther("100"),         // hard cap (100 ETH)
    startTime,
    endTime
  );
  await ico.deployed();
  console.log("ICO deployed to:", ico.address);

  // Transfer tokens to ICO contract
  console.log("\nSetting up ICO...");
  const icoTokens = ethers.utils.parseEther("500000"); // 500k tokens for ICO
  await token.transfer(ico.address, icoTokens);
  console.log("Transferred", ethers.utils.formatEther(icoTokens), "tokens to ICO contract");

  // Print deployment timestamps
  console.log("\nICO Timeline:");
  console.log("Start time:", new Date(startTime * 1000).toLocaleString());
  console.log("End time:  ", new Date(endTime * 1000).toLocaleString());

  // Verify contract addresses
  console.log("\nToken supply:", ethers.utils.formatEther(await token.totalSupply()));
  console.log("ICO token balance:", ethers.utils.formatEther(await token.balanceOf(ico.address)));
  
  // Write contract addresses to a file
  const addresses = {
    token: token.address,
    ico: ico.address
  };

  // Ensure the directory exists
  const addressDir = path.join(__dirname, '../src/contracts');
  if (!fs.existsSync(addressDir)) {
    fs.mkdirSync(addressDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(addressDir, 'addresses.js'),
    `export const TOKEN_ADDRESS = "${token.address}";\nexport const ICO_ADDRESS = "${ico.address}";`
  );

  console.log("\nContract addresses have been written to src/contracts/addresses.js");
  console.log("\nDeployment complete! 🚀");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });