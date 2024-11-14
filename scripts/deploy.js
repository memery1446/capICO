const hre = require("hardhat");

async function main() {
  const NAME = 'ICO Token'
  const SYMBOL = 'ICO'
  const INITIAL_SUPPLY = '1000000'
  const SOFT_CAP = ethers.utils.parseUnits('100', 'ether')
  const MIN_INVESTMENT = ethers.utils.parseUnits('0.1', 'ether')
  const MAX_INVESTMENT = ethers.utils.parseUnits('50', 'ether')

  // Deploy Token
  const Token = await hre.ethers.getContractFactory('Token')
  const token = await Token.deploy(NAME, SYMBOL, INITIAL_SUPPLY)
  await token.deployed()
  console.log(`Token deployed to: ${token.address}`)

  // Deploy CapICO
  const CapICO = await hre.ethers.getContractFactory('CapICO')
  const capico = await CapICO.deploy(
    token.address,
    SOFT_CAP,
    MIN_INVESTMENT,
    MAX_INVESTMENT
  )
  await capico.deployed()
  console.log(`CapICO deployed to: ${capico.address}`)

  // Transfer tokens to ICO contract
  const transaction = await token.transfer(capico.address, ethers.utils.parseUnits(INITIAL_SUPPLY, 'ether'))
  await transaction.wait()
  console.log('Tokens transferred to ICO')

  // Optional: Set up first tier
  const currentTime = Math.floor(Date.now() / 1000)
  await capico.addTier(
    ethers.utils.parseUnits('0.001', 'ether'), // price
    ethers.utils.parseUnits('250000', 'ether'), // maxTokens
    currentTime + 3600, // startTime (1 hour from now)
    currentTime + 86400 // endTime (24 hours from now)
  )
  console.log('First tier configured')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
