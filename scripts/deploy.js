const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Token first
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("Test Token", "TEST", "1000000");
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Get current timestamp for tier timing
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const day = 24 * 60 * 60;
  
  // Set up tier parameters
  const startTime1 = currentTimestamp + 300; // Starts in 5 minutes
  const endTime1 = startTime1 + (7 * day); // 7 days duration
  const startTime2 = endTime1 + 1; // Starts right after tier 1
  const endTime2 = startTime2 + (7 * day); // Another 7 days

  const CapICO = await ethers.getContractFactory("CapICO");
  const capico = await CapICO.deploy(
    token.address,                    // token address
    ethers.utils.parseEther("100"),   // softCap: 100 ETH
    ethers.utils.parseEther("0.1"),   // minInvestment: 0.1 ETH
    ethers.utils.parseEther("50"),    // maxInvestment: 50 ETH
    [                                 // prices array
      ethers.utils.parseEther("0.001"),  // Tier 1: 0.001 ETH per token
      ethers.utils.parseEther("0.002")   // Tier 2: 0.002 ETH per token
    ],
    [                                 // maxTokens array
      ethers.utils.parseEther("100000"),  // Tier 1: 100,000 tokens
      ethers.utils.parseEther("100000")   // Tier 2: 100,000 tokens
    ],
    [startTime1, startTime2],         // startTimes array
    [endTime1, endTime2]              // endTimes array
  );

  await capico.deployed();
  console.log("CapICO deployed to:", capico.address);

  // Transfer tokens to the CapICO contract
  const transferAmount = ethers.utils.parseEther("200000"); // 200,000 tokens
  await token.transfer(capico.address, transferAmount);
  console.log("Transferred tokens to CapICO contract");

  // Verify contract on Etherscan
  console.log("Verifying contracts...");
  try {
    await hre.run("verify:verify", {
      address: capico.address,
      constructorArguments: [
        token.address,
        ethers.utils.parseEther("100"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("50"),
        [ethers.utils.parseEther("0.001"), ethers.utils.parseEther("0.002")],
        [ethers.utils.parseEther("100000"), ethers.utils.parseEther("100000")],
        [startTime1, startTime2],
        [endTime1, endTime2]
      ],
    });
    console.log("CapICO verified on Etherscan");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  