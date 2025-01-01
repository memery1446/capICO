// src/services/web3Service.js
import { ethers } from 'ethers';
import { CAPICO_ADDRESS, TOKEN_ADDRESS } from '../utils/constants';
import CapICOContract from '../contracts/CapICO.json';
import TokenContract from '../contracts/Token.json';

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {
      capICO: null,
      token: null
    };
    this.isInitialized = false;
  }

  async init() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.providers.Web3Provider(window.ethereum, {
          name: 'localhost',
          chainId: 31337 // Hardhat's default chain ID
        });

        await this.provider.send("eth_requestAccounts", []);
        this.signer = this.provider.getSigner();
        
        this.contracts.capICO = new ethers.Contract(CAPICO_ADDRESS, CapICOContract.abi, this.signer);
        this.contracts.token = new ethers.Contract(TOKEN_ADDRESS, TokenContract.abi, this.signer);
        
        this.isInitialized = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Initialization error:', error);
      return false;
    }
  }

  async isConnected() {
    if (!this.provider || !this.signer) return false;
    try {
      const accounts = await this.provider.listAccounts();
      return accounts.length > 0;
    } catch (error) {
      return false;
    }
  }

  async connect() {
    if (!this.isInitialized) {
      return this.init();
    }
    try {
      await this.provider.send("eth_requestAccounts", []);
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }

  async disconnect() {
    this.signer = null;
    return true;
  }

  async getTransferCooldownTime(address) {
    try {
      const lastTransfer = await this.contracts.token.lastTransferTime(address);
      const demoTransferCooldown = await this.contracts.token.DEMO_TRANSFER_COOLDOWN();
      const normalTransferCooldown = await this.contracts.token.TRANSFER_COOLDOWN();
      
      // Use demo cooldown by default for testing
      const cooldownPeriod = demoTransferCooldown;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const nextAllowedTransfer = lastTransfer.toNumber() + cooldownPeriod.toNumber();
      
      if (nextAllowedTransfer > currentTime) {
        return nextAllowedTransfer - currentTime;
      }
      return 0;
    } catch (error) {
      console.error('Error getting cooldown time:', error);
      return 0;
    }
  }

  async getDetailedICOStatus() {
    try {
      const [
        startTime,
        endTime,
        totalRaised,
        softCap,
        hardCap,
        tokenPrice,
        isFinalized
      ] = await Promise.all([
        this.contracts.capICO.startTime(),
        this.contracts.capICO.endTime(),
        this.contracts.capICO.totalRaised(),
        this.contracts.capICO.softCap(),
        this.contracts.capICO.hardCap(),
        this.contracts.capICO.tokenPrice(),
        this.contracts.capICO.isFinalized()
      ]);

      const address = await this.getAddress();
      const isWhitelisted = await this.contracts.capICO.whitelist(address);

      const now = Math.floor(Date.now() / 1000);
      const isActive = now >= startTime.toNumber() && 
                      now <= endTime.toNumber() && 
                      !isFinalized;

      return {
        startTime: startTime.toNumber(),
        endTime: endTime.toNumber(),
        totalRaised: ethers.utils.formatEther(totalRaised),
        softCap: ethers.utils.formatEther(softCap),
        hardCap: ethers.utils.formatEther(hardCap),
        tokenPrice: ethers.utils.formatEther(tokenPrice),
        isFinalized,
        isActive,
        isCurrentUserWhitelisted: isWhitelisted
      };
    } catch (error) {
      console.error('Error fetching ICO status:', error);
      throw error;
    }
  }

  async getTokenBalance(address) {
    const balance = await this.contracts.token.balanceOf(address);
    return ethers.utils.formatEther(balance);
  }

  async getAddress() {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  async isOwner() {
    const address = await this.getAddress();
    const owner = await this.contracts.capICO.owner();
    return address?.toLowerCase() === owner?.toLowerCase();
  }

  async updateWhitelist(users, status) {
    const tx = await this.contracts.capICO.updateWhitelist(users, status);
    return tx.wait();
  }
}

const web3Service = new Web3Service();
export default web3Service;