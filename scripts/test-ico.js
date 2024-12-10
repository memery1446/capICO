// scripts/test-ico.js
const hre = require("hardhat");

async function main() {
  const [owner, investor1, investor2] = await ethers.getSigners();
  
  // Get contract instances
  const capico = await ethers.getContractAt("CapICO", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  const token = await ethers.getContractAt("Token", "0x5FbDB2315678afecb367f032d93F642f64180aa3");

  console.log("\nTesting ICO Functionality");
  console.log("------------------------");

  // Check ICO status
  const status = await capico.getICOStatus();
  console.log("ICO Status:", {
    isActive: status.isActive,
    hasStarted: status.hasStarted,
    hasEnded: status.hasEnded,
    remainingTime: status.remainingTime.toString()
  });

  // Make a purchase if ICO is active
  if (status.isActive) {
    try {
      const purchaseAmount = ethers.utils.parseEther("0.1"); // 0.1 ETH
      const tx = await capico.connect(investor1).buyTokens(
        ethers.utils.parseEther("100"), // 100 tokens
        { value: purchaseAmount }
      );
      await tx.wait();
      console.log("Purchase successful!");
      
      // Check balances
      const tokenBalance = await token.balanceOf(investor1.address);
      console.log("Investor token balance:", ethers.utils.formatEther(tokenBalance));
    } catch (error) {
      console.error("Purchase failed:", error.message);
    }
  } else {
    console.log("ICO is not active");
  }

  // Print overall ICO stats
  const totalRaised = await capico.totalRaised();
  const totalTokensSold = await capico.totalTokensSold();
  
  console.log("\nICO Statistics");
  console.log("------------------------");
  console.log("Total Raised:", ethers.utils.formatEther(totalRaised), "ETH");
  console.log("Total Tokens Sold:", ethers.utils.formatEther(totalTokensSold));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  