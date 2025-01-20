const hre = require("hardhat");
const ethers = hre.ethers;
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance));

  try {
    // Deploy Token
    const Token = await ethers.getContractFactory("ICOToken");
    console.log("Deploying Token...");
    const token = await Token.deploy(
      "Demo Token",
      "DEMO",
      ethers.utils.parseEther("1000000") // 1 million tokens
    );
    await token.deployed();
    console.log("Token deployed to:", token.address);

    // Deploy ICO
    const ICO = await ethers.getContractFactory("CapICO");
    console.log("Deploying ICO...");
    const ico = await ICO.deploy(
      token.address,
      ethers.utils.parseEther("0.001"), // 0.001 ETH per token
      ethers.utils.parseEther("200")    // 200 ETH hardcap
    );
    await ico.deployed();
    console.log("ICO deployed to:", ico.address);

    // Transfer tokens to ICO with verification
    const icoTokens = ethers.utils.parseEther("500000");
    console.log("Transferring tokens to ICO...");
    const transferTx = await token.transfer(ico.address, icoTokens);
    await transferTx.wait();
    
    // Verify the transfer
    const icoBalance = await token.balanceOf(ico.address);
    console.log("ICO token balance:", ethers.utils.formatEther(icoBalance));

    // Whitelist the deployer with verification
    console.log("Whitelisting deployer...");
    const whitelistTx = await ico.updateWhitelist([deployer.address], true);
    await whitelistTx.wait();
    
    // Verify whitelist
    const isWhitelisted = await ico.whitelist(deployer.address);
    console.log("Deployer whitelisted status:", isWhitelisted);

    // Add tier with verification
    console.log("Adding tier...");
    const tierTx = await ico.addTier(
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("5"),
      5
    );
    await tierTx.wait();

    // Verify tier
    const tierCount = await ico.getTierCount();
    console.log("Number of tiers:", tierCount.toString());

    // Write addresses to file
    const addressDir = path.join(__dirname, '../src/contracts');
    if (!fs.existsSync(addressDir)) {
      fs.mkdirSync(addressDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(addressDir, 'addresses.js'),
      `export const TOKEN_ADDRESS = "${token.address}";\nexport const ICO_ADDRESS = "${ico.address}";`
    );

    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("Token Address:", token.address);
    console.log("ICO Address:", ico.address);
    console.log("Owner Address:", deployer.address);
    console.log("ICO Token Balance:", ethers.utils.formatEther(icoBalance));
    console.log("Contract addresses written to src/contracts/addresses.js");

  } catch (error) {
    console.error("\nDeployment Error:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled Error:");
    console.error(error);
    process.exit(1);
  });

  