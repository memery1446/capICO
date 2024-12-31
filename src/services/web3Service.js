import { ethers } from 'ethers';

const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';

const ICOContractABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}],
    "name": "buyTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
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
  },
  {
    "inputs": [],
    "name": "tokenPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startTime",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endTime",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const TokenContractABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "lastTransferTime",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TRANSFER_COOLDOWN",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.icoContract = null;
    this.tokenContract = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) {
      console.log('Web3Service already initialized');
      return true;
    }

    try {
      console.log('Initializing Web3Service...');
      
      if (window.ethereum) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        await this.provider.send("eth_requestAccounts", []);
      } else {
        this.provider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC_URL);
      }
      console.log('Provider created');

      const network = await this.provider.getNetwork();
      console.log('Connected to network:', network);

      this.signer = this.provider.getSigner();
      const address = await this.signer.getAddress();
      console.log('Using account:', address);

      const icoContractAddress = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
      const tokenContractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

      console.log('Initializing ICO contract at:', icoContractAddress);
      console.log('Initializing Token contract at:', tokenContractAddress);

      // Verify contract deployments
      const icoCode = await this.provider.getCode(icoContractAddress);
      const tokenCode = await this.provider.getCode(tokenContractAddress);
      if (icoCode === '0x' || tokenCode === '0x') {
        throw new Error('One or more contracts not deployed at the specified addresses');
      }

      console.log('Contract code found at the specified addresses');

      this.icoContract = new ethers.Contract(icoContractAddress, ICOContractABI, this.signer);
      this.tokenContract = new ethers.Contract(tokenContractAddress, TokenContractABI, this.signer);
      console.log('Contract instances created');

      // Verify contract connections
      await this.icoContract.totalRaised();
      await this.tokenContract.balanceOf(address);
      console.log('Contract connections verified');

      this.isInitialized = true;
      console.log('Web3Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }
    if (!this.isInitialized) {
      throw new Error('Web3Service is not initialized');
    }
  }

  async connect() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return this.init();
      } catch (error) {
        console.error('Failed to connect to wallet:', error);
        return false;
      }
    } else {
      console.error('Ethereum provider not found');
      return false;
    }
  }

  async disconnect() {
    this.provider = null;
    this.signer = null;
    this.icoContract = null;
    this.tokenContract = null;
    this.isInitialized = false;
  }

  async isConnected() {
    return this.isInitialized && this.signer !== null;
  }

  async getAddress() {
    if (this.signer) {
      return await this.signer.getAddress();
    }
    return null;
  }


  async buyTokens(amount) {
    await this.ensureInitialized();
    try {
      console.log(`Attempting to buy tokens for ${amount} ETH...`);
      const tokenPrice = await this.icoContract.tokenPrice();
      const tokenAmount = ethers.utils.parseEther(amount).mul(ethers.constants.WeiPerEther).div(tokenPrice);
      console.log(`Calculated token amount: ${ethers.utils.formatEther(tokenAmount)} tokens`);
      
      const tx = await this.icoContract.buyTokens(tokenAmount, {
        value: ethers.utils.parseEther(amount)
      });
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.transactionHash);
      console.log('Token purchase successful');
    } catch (error) {
      console.error('Error buying tokens:', error);
      if (error.reason && error.reason.includes('Transfer cooldown active')) {
        throw new Error('Transfer cooldown active. Please wait before making another purchase.');
      } else if (error.reason) {
        throw new Error(`Failed to buy tokens: ${error.reason}`);
      } else {
        throw error;
      }
    }
  }

  async getICOStatus() {
    try {
      await this.ensureInitialized();
      
      const totalRaised = await this.icoContract.totalRaised();
      const softCap = await this.icoContract.softCap();
      const hardCap = await this.icoContract.hardCap();
      const isFinalized = await this.icoContract.isFinalized();
      const tokenPrice = await this.icoContract.tokenPrice();
      const startTime = await this.icoContract.startTime();
      const endTime = await this.icoContract.endTime();
      const currentTime = Math.floor(Date.now() / 1000);

      return {
        totalRaised: ethers.utils.formatEther(totalRaised),
        softCap: ethers.utils.formatEther(softCap),
        hardCap: ethers.utils.formatEther(hardCap),
        isFinalized,
        tokenPrice: ethers.utils.formatEther(tokenPrice),
        startTime: startTime.toNumber(),
        endTime: endTime.toNumber(),
        currentTime,
        isActive: currentTime >= startTime.toNumber() && currentTime <= endTime.toNumber(),
        hasStarted: currentTime >= startTime.toNumber(),
        hasEnded: currentTime > endTime.toNumber()
      };
    } catch (error) {
      console.error('Error getting ICO status:', error);
      throw error;
    }
  }

  async getTokenBalance(address) {
    await this.ensureInitialized();
    try {
      const balance = await this.tokenContract.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }

  async getTransferCooldownTime(address) {
    await this.ensureInitialized();
    try {
      const lastTransferTime = await this.tokenContract.lastTransferTime(address);
      const cooldownPeriod = await this.tokenContract.TRANSFER_COOLDOWN();
      const currentTime = Math.floor(Date.now() / 1000);
      const cooldownEndTime = lastTransferTime.add(cooldownPeriod).toNumber();
      
      if (cooldownEndTime > currentTime) {
        return cooldownEndTime - currentTime;
      }
      return 0;
    } catch (error) {
      console.error('Error getting transfer cooldown time:', error);
      throw error;
    }
  }
}

export default new Web3Service();

