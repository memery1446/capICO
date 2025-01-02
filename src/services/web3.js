// src/services/web3.js
import { ethers } from 'ethers';
import { ICO_ADDRESS, TOKEN_ADDRESS } from '../contracts/addresses';
import ICOToken from '../contracts/ICOToken.json';
import CapICO from '../contracts/CapICO.json';

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {
      token: null,
      ico: null
    };
  }

  async init() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask');
      }

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = this.provider.getSigner();

      this.contracts.ico = new ethers.Contract(ICO_ADDRESS, CapICO.abi, this.signer);
      this.contracts.token = new ethers.Contract(TOKEN_ADDRESS, ICOToken.abi, this.signer);

      return true;
    } catch (error) {
      console.error('Initialization error:', error);
      return false;
    }
  }

  async getICOStatus() {
    try {
      const [
        totalRaised,
        hardCap,
        tokenPrice,
        isActive
      ] = await Promise.all([
        this.contracts.ico.totalRaised(),
        this.contracts.ico.hardCap(),
        this.contracts.ico.tokenPrice(),
        this.contracts.ico.isActive()
      ]);

      return {
        totalRaised: ethers.utils.formatEther(totalRaised),
        hardCap: ethers.utils.formatEther(hardCap),
        tokenPrice: ethers.utils.formatEther(tokenPrice),
        isActive
      };
    } catch (error) {
      console.error('Error getting ICO status:', error);
      throw error;
    }
  }

  async getTokenBalance(address) {
    const balance = await this.contracts.token.balanceOf(address);
    return ethers.utils.formatEther(balance);
  }

  async getAddress() {
    return await this.signer.getAddress();
  }

  async isWhitelisted(address) {
    return await this.contracts.ico.whitelist(address);
  }

  async buyTokens(amount) {
    const tx = await this.contracts.ico.buyTokens({
      value: ethers.utils.parseEther(amount)
    });
    return tx.wait();
  }
}

const web3Service = new Web3Service();
export default web3Service;


