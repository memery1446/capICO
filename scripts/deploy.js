// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const NAME = 'CKOIN Token'
  const SYMBOL = 'CKOIN'
  const MAX_SUPPLY = '1000000'
  const PRICE = ethers.utils.parseUnits('0.025', 'ether')

  const Token = await hre.ethers.getContractFactory('Token')
  let token = await Token.deploy('CKOIN TOKEN', 'CKOIN', '1000000')
  await token.deployed()

  console.log(`Token deployed to: ${token.address}\n`)

  const capICO = await hre.ethers.getContractFactory('capICO')
  const capico = await capICO.deploy(token.address, PRICE, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'))
  await capico.deployed()

  console.log(`capICO deployed to: ${capico.address}\n`)

  // Tokens to ICO

  const transaction = await token.transfer(capico.address, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'))
  await transaction.wait()

  console.log('Tokens transferrred to ICO')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
