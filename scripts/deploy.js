const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Token first
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("Test Token", "TEST", "1000000");
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Get current timestamp
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const startTime = currentTimestamp + 300; // Starts in 5 minutes
  const endTime = startTime + (7 * 24 * 60 * 60); // 7 days duration

  const CapICO = await ethers.getContractFactory("CapICO");
  const capico = await CapICO.deploy(
    token.address,                      // Token contract address
    ethers.utils.parseEther("0.001"),   // tokenPrice (in ETH)
    ethers.utils.parseEther("50"),      // softCap (in ETH)
    ethers.utils.parseEther("100"),     // hardCap (in ETH)
    ethers.utils.parseEther("0.1"),     // minInvestment (in ETH)
    ethers.utils.parseEther("10"),      // maxInvestment (in ETH)
    startTime,                          // startTime
    endTime                             // endTime
  );

  await capico.deployed();
  console.log("CapICO deployed to:", capico.address);

  // Transfer tokens to the CapICO contract
  const transferAmount = ethers.utils.parseEther("200000"); // 200,000 tokens
  await token.transfer(capico.address, transferAmount);
  console.log("Transferred tokens to CapICO contract");

  // Log all constructor parameters for verification
  console.log("Constructor Parameters:");
  console.log("Token Address:", token.address);
  console.log("Token Price:", ethers.utils.formatEther(ethers.utils.parseEther("0.001")), "ETH");
  console.log("Soft Cap:", ethers.utils.formatEther(ethers.utils.parseEther("50")), "ETH");
  console.log("Hard Cap:", ethers.utils.formatEther(ethers.utils.parseEther("100")), "ETH");
  console.log("Min Investment:", ethers.utils.formatEther(ethers.utils.parseEther("0.1")), "ETH");
  console.log("Max Investment:", ethers.utils.formatEther(ethers.utils.parseEther("10")), "ETH");
  console.log("Start Time:", new Date(startTime * 1000).toLocaleString());
  console.log("End Time:", new Date(endTime * 1000).toLocaleString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  