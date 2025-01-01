// scripts/reset-network.js
const hre = require("hardhat");

async function main() {
  console.log("Resetting Hardhat network...");
  
  // Reset the network
  await network.provider.send("hardhat_reset");
  
  // Set current time
  const now = Math.floor(Date.now() / 1000);
  await network.provider.send("evm_setNextBlockTimestamp", [now]);
  await network.provider.send("evm_mine");
  
  // Verify time
  const block = await ethers.provider.getBlock('latest');
  console.log("Network reset complete!");
  console.log("Current block timestamp:", new Date(block.timestamp * 1000).toLocaleString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

  