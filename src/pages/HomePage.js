import { ethers } from 'ethers';

const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';

const CapICOAbi = [
  {
    "inputs": [],
    "name": "totalRaised",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "softCap",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hardCap",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isFinalized",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.capICO = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      console.log('Initializing Web3Service with direct Hardhat connection...');
      
      this.provider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC_URL);
      console.log('Provider created');

      const network = await this.provider.getNetwork();
      console.log('Connected to network:', network);

      // Get the first account from Hardhat's default accounts
      const accounts = await this.provider.listAccounts();
      this.signer = this.provider.getSigner(accounts[0]);
      console.log('Using account:', accounts[0]);

      const balance = await this.provider.getBalance(accounts[0]);
      console.log('Account balance:', ethers.utils.formatEther(balance), 'ETH');

      const latestBlock = await this.provider.getBlockNumber();
      console.log('Latest block number:', latestBlock);

      const capICOAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // This is usually the address for the first deployed contract in Hardhat
      console.log('Attempting to initialize CapICO contract at:', capICOAddress);

      // Verify contract deployment
      const code = await this.provider.getCode(capICOAddress);
      if (code === '0x') {
        throw new Error('Contract not deployed at the specified address');
      }

      console.log('Contract code found at the specified address');

      this.capICO = new ethers.Contract(capICOAddress, CapICOAbi, this.signer);
      console.log('CapICO contract instance created');

      // Try to call a view function to verify the contract is working
      const totalRaised = await this.capICO.totalRaised();
      console.log('Total raised:', totalRaised.toString());

      this.isInitialized = true;
      console.log('Web3Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      return false;
    }
  }

  async getICOData() {
    if (!this.isInitialized) {
      const initialized = await this.init();
      if (!initialized) {
        throw new Error('Failed to initialize Web3Service');
      }
    }
    try {
      console.log('Fetching ICO data...');
      const totalRaised = await this.capICO.totalRaised();
      const softCap = await this.capICO.softCap();
      const hardCap = await this.capICO.hardCap();
      const isFinalized = await this.capICO.isFinalized();

      return {
        totalRaised: ethers.utils.formatEther(totalRaised),
        softCap: ethers.utils.formatEther(softCap),
        hardCap: ethers.utils.formatEther(hardCap),
        isFinalized
      };
    } catch (error) {
      console.error('Error fetching ICO data:', error);
      throw error;
    }
  }

  async getNetworkInfo() {
    if (!this.isInitialized) {
      await this.init();
    }
    return await this.provider.getNetwork();
  }
}

export default new Web3Service();

