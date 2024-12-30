const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Demo deploying contracts with account:", deployer.address);

  // Deploy Token
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(
    "Demo Token",
    "DEMO",
    "1000000"  // 1M tokens initial supply
  );
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Set short timeframes for demo testing
  const now = Math.floor(Date.now() / 1000);
  const startTime = now + 30;        // Starts in 30 seconds
  const endTime = startTime + 300;   // Runs for 5 minutes

  // Deploy ICO with small caps for easy testing
  const CapICO = await ethers.getContractFactory("CapICO");
  const capico = await CapICO.deploy(
    token.address,
    ethers.utils.parseEther("0.001"),   // tokenPrice: 0.001 ETH
    ethers.utils.parseEther("0.05"),    // softCap: 0.05 ETH
    ethers.utils.parseEther("0.2"),     // hardCap: 0.2 ETH
    ethers.utils.parseEther("0.01"),    // minInvestment: 0.01 ETH
    ethers.utils.parseEther("0.1"),     // maxInvestment: 0.1 ETH
    startTime,
    endTime
  );
  await capico.deployed();
  console.log("CapICO deployed to:", capico.address);

  // Transfer tokens to ICO contract
  const transferAmount = ethers.utils.parseEther("1000"); // 1000 tokens for demo
  await token.transfer(capico.address, transferAmount);
  console.log("Transferred tokens to CapICO contract");

  console.log("\n--- DEMO DEPLOYMENT INFO ---");
  console.log("Token:", token.address);
  console.log("CapICO:", capico.address);
  console.log("\nTimeline:");
  console.log("ICO Starts: in 30 seconds");
  console.log("ICO Duration: 5 minutes");
  console.log("\nQuick Test Values:");
  console.log("To participate, send between 0.01 and 0.1 ETH");
  console.log("Token price: 0.001 ETH");
  console.log("Soft cap: 0.05 ETH");
  console.log("Hard cap: 0.2 ETH");

  // Helpful testing info
  console.log("\n--- TESTING GUIDE ---");
  console.log("1. Wait 30 seconds for ICO to start");
  console.log("2. Send ETH between 0.01 and 0.1 to:", capico.address);
  console.log("3. Token Distribution:");
  console.log("   - 50% immediately");
  console.log("   - 25% after first vesting period");
  console.log("   - 25% after second vesting period");

  // Log actual timestamps for verification
  console.log("\n--- TIMESTAMPS ---");
  console.log("Start:", new Date(startTime * 1000).toLocaleString());
  console.log("End:", new Date(endTime * 1000).toLocaleString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  