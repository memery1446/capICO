require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 1337
    },
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY],
<<<<<<< HEAD
      chainId: 11155111,
      timeout: 0,
      gas: 2100000,
      gasPrice: 8000000000  // 8 gwei
=======
      chainId: 11155111
>>>>>>> f74552f99c461be4cb8c4eef6ecf7d670dac6c9f
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
<<<<<<< HEAD
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
=======
>>>>>>> f74552f99c461be4cb8c4eef6ecf7d670dac6c9f
  }
};

