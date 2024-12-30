const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Token
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(
    "Portfolio Token",  // name
    "PFLIO",           // symbol
    "1000000"          // initial supply (1 million)
  );
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Wait for few block confirmations to ensure etherscan picks up the deployment
  await token.deployTransaction.wait(5);

  // Verify Token contract on Sepolia
  if (hre.network.name === "sepolia") {
    await hre.run("verify:verify", {
      address: token.address,
      constructorArguments: [
        "Portfolio Token",
        "PFLIO",
        "1000000"
      ],
    });
  }

  // Calculate ICO times (7 days from now for Sepolia, 10 minutes for local)
  const now = Math.floor(Date.now() / 1000);
  const isDemoMode = hre.network.name === "localhost" || hre.network.name === "hardhat";
  const startTime = now + (isDemoMode ? 60 : 3600);          // 1 min or 1 hour delay
  const duration = isDemoMode ? 10 * 60 : 7 * 24 * 60 * 60;  // 10 mins or 7 days
  const endTime = startTime + duration;

  // Set ICO parameters based on network
  const params = isDemoMode ? {
    tokenPrice: "0.001",    // 0.001 ETH per token
    softCap: "0.05",        // 0.05 ETH
    hardCap: "0.2",         // 0.2 ETH
    minInvestment: "0.01",  // 0.01 ETH
    maxInvestment: "0.1",   // 0.1 ETH
    tokensForICO: "1000"    // 1000 tokens
  } : {
    tokenPrice: "0.001",    // 0.001 ETH per token
    softCap: "10",          // 10 ETH
    hardCap: "50",          // 50 ETH
    minInvestment: "0.01",  // 0.01 ETH
    maxInvestment: "5",     // 5 ETH
    tokensForICO: "50000"   // 50000 tokens
  };

  // Deploy CapICO
  const CapICO = await ethers.getContractFactory("CapICO");
  const capico = await CapICO.deploy(
    token.address,
    ethers.utils.parseEther(params.tokenPrice),
    ethers.utils.parseEther(params.softCap),
    ethers.utils.parseEther(params.hardCap),
    ethers.utils.parseEther(params.minInvestment),
    ethers.utils.parseEther(params.maxInvestment),
    startTime,
    endTime
  );
  await capico.deployed();
  console.log("CapICO deployed to:", capico.address);

  // Wait for confirmations if on Sepolia
  if (hre.network.name === "sepolia") {
    await capico.deployTransaction.wait(5);
    
    // Verify CapICO contract
    await hre.run("verify:verify", {
      address: capico.address,
      constructorArguments: [
        token.address,
        ethers.utils.parseEther(params.tokenPrice),
        ethers.utils.parseEther(params.softCap),
        ethers.utils.parseEther(params.hardCap),
        ethers.utils.parseEther(params.minInvestment),
        ethers.utils.parseEther(params.maxInvestment),
        startTime,
        endTime
      ],
    });
  }

  // Transfer tokens to the ICO contract
  const transferAmount = ethers.utils.parseEther(params.tokensForICO);
  await token.transfer(capico.address, transferAmount);
  console.log("Transferred tokens to CapICO contract");

  // Log deployment summary
  console.log("\nDeployment Summary");
  console.log("------------------");
  console.log("Network:", hre.network.name);
  console.log("Token Address:", token.address);
  console.log("CapICO Address:", capico.address);
  console.log("\nTimeline");
  console.log("ICO Starts:", new Date(startTime * 1000).toLocaleString());
  console.log("ICO Ends:", new Date(endTime * 1000).toLocaleString());
  console.log("Duration:", isDemoMode ? "10 minutes" : "7 days");
  
  console.log("\nParameters");
  console.log("Token Price:", params.tokenPrice, "ETH");
  console.log("Soft Cap:", params.softCap, "ETH");
  console.log("Hard Cap:", params.hardCap, "ETH");
  console.log("Min Investment:", params.minInvestment, "ETH");
  console.log("Max Investment:", params.maxInvestment, "ETH");
  console.log("Tokens in ICO:", params.tokensForICO);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  