const { ethers } = require("hardhat");

async function verify() {
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Your contract addresses
  const capicoAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log("Checking contract deployment...");
  
  const capicoCode = await provider.getCode(capicoAddress);
  const tokenCode = await provider.getCode(tokenAddress);
  
  console.log("CapICO bytecode length:", capicoCode.length);
  console.log("Token bytecode length:", tokenCode.length);
  
  // A deployed contract should have bytecode longer than '0x'
  console.log("CapICO deployed:", capicoCode !== "0x");
  console.log("Token deployed:", tokenCode !== "0x");
}

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  