const hre = require("hardhat");

async function main() {
  const SimpleICO = await hre.ethers.getContractFactory("SimpleICO");
  const simpleICO = await SimpleICO.deploy();

  await simpleICO.deployed();

  console.log("SimpleICO deployed to:", simpleICO.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

