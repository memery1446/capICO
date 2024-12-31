const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Token
  const Token = await ethers.getContractFactory("Token");
  const initialSupply = ethers.utils.parseEther("1000000"); // 1 million tokens
  const token = await Token.deploy("MyToken", "MTK", 1000000); // 1 million tokens

  await token.deployed();

  console.log("Token deployed to:", token.address);

  // Deploy CapICO
  const CapICO = await ethers.getContractFactory("CapICO");
  const tokenPrice = ethers.utils.parseEther("0.001"); // 0.001 ETH per token
  const softCap = ethers.utils.parseEther("50"); // 50 ETH
  const hardCap = ethers.utils.parseEther("200"); // 200 ETH
  const minInvestment = ethers.utils.parseEther("0.1"); // 0.1 ETH
  const maxInvestment = ethers.utils.parseEther("10"); // 10 ETH
  const startTime = Math.floor(Date.now() / 1000) + 60; // Start in 1 minute
  const endTime = startTime + 3600; // End 1 hour after start

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

  console.log("CapICO deployed to:", capICO.address);

  // Transfer tokens to CapICO contract
  const icoTokens = ethers.utils.parseEther("200000"); // 200,000 tokens for ICO
  await token.transfer(capICO.address, icoTokens);
  console.log("Transferred tokens to CapICO contract");

  // Verify deployments
  console.log("\nDeployment verification:");
  console.log("Token name:", await token.name());
  console.log("Token symbol:", await token.symbol());
  console.log("Token total supply:", ethers.utils.formatEther(await token.totalSupply()));
  console.log("CapICO token address:", await capICO.token());
  console.log("CapICO token price:", ethers.utils.formatEther(await capICO.tokenPrice()));
  console.log("CapICO soft cap:", ethers.utils.formatEther(await capICO.softCap()));
  console.log("CapICO hard cap:", ethers.utils.formatEther(await capICO.hardCap()));
  console.log("CapICO start time:", new Date((await capICO.startTime()).toNumber() * 1000).toLocaleString());
  console.log("CapICO end time:", new Date((await capICO.endTime()).toNumber() * 1000).toLocaleString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

