const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  // Get the contract
  const CapICO = await ethers.getContractFactory("CapICO");
  const capICO = await CapICO.attach("0xe7f1725e7734ce288f8367e1bb143e90bb3f0512");

  // Get current blockchain time
  const currentBlock = await ethers.provider.getBlock('latest');
  console.log("\nCurrent Blockchain State:");
  console.log("Current block timestamp:", new Date(currentBlock.timestamp * 1000).toLocaleString());

  // Get all relevant contract data
  const [
    startTime,
    endTime,
    totalRaised,
    softCap,
    hardCap,
    tokenPrice,
    isFinalized
  ] = await Promise.all([
    capICO.startTime(),
    capICO.endTime(),
    capICO.totalRaised(),
    capICO.softCap(),
    capICO.hardCap(),
    capICO.tokenPrice(),
    capICO.isFinalized()
  ]);

  console.log("\nContract Values:");
  console.log("Start Time:", new Date(startTime.toNumber() * 1000).toLocaleString());
  console.log("End Time:", new Date(endTime.toNumber() * 1000).toLocaleString());
  console.log("Total Raised:", ethers.utils.formatEther(totalRaised), "ETH");
  console.log("Soft Cap:", ethers.utils.formatEther(softCap), "ETH");
  console.log("Hard Cap:", ethers.utils.formatEther(hardCap), "ETH");
  console.log("Token Price:", ethers.utils.formatEther(tokenPrice), "ETH");
  console.log("Is Finalized:", isFinalized);

  // Get raw values for debugging
  console.log("\nRaw Values (for debugging):");
  console.log("startTime (raw):", startTime.toString());
  console.log("endTime (raw):", endTime.toString());
  console.log("totalRaised (raw):", totalRaised.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });