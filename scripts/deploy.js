// scripts/deploy.js
const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Token
  const Token = await ethers.getContractFactory("ICOToken");
  const token = await Token.deploy(
    "Demo Token",
    "DEMO",
    1000000 // 1 million tokens
  );
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Deploy ICO
  const ICO = await ethers.getContractFactory("CapICO");
  const ico = await ICO.deploy(
    token.address,
    ethers.utils.parseEther("0.001"), // 0.001 ETH per token
    ethers.utils.parseEther("200")    // 200 ETH hardcap
  );
  await ico.deployed();
  console.log("ICO deployed to:", ico.address);

  // Transfer tokens to ICO
  const icoTokens = ethers.utils.parseEther("500000"); // 500k tokens for ICO
  await token.transfer(ico.address, icoTokens);
  console.log("Transferred", ethers.utils.formatEther(icoTokens), "tokens to ICO");

  // Write addresses to file
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

  