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

      console.log('Initializing contracts with addresses:', {
        ico: ICO_ADDRESS,
        token: TOKEN_ADDRESS
      });

      this.contracts.ico = new ethers.Contract(ICO_ADDRESS, CapICO.abi, this.signer);
      this.contracts.token = new ethers.Contract(TOKEN_ADDRESS, ICOToken.abi, this.signer);

      return true;
    } catch (error) {
      console.error('Initialization error:', error);
      throw error;
    }
  }

  async isOwner() {
    try {
      const address = await this.signer.getAddress();
      const owner = await this.contracts.ico.owner();
      return address.toLowerCase() === owner.toLowerCase();
    } catch (error) {
      console.error('Error checking owner status:', error);
      return false;
    }
  }

  async getICOStatus() {
    try {
      const [
        startTime,
        endTime,
        tokenPrice,
        hardCap,
        totalRaised
      ] = await Promise.all([
        this.contracts.ico.startTime(),
        this.contracts.ico.endTime(),
        this.contracts.ico.tokenPrice(),
        this.contracts.ico.hardCap(),
        this.contracts.ico.totalRaised()
      ]);

      console.log('Raw ICO Status:', {
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        tokenPrice: tokenPrice.toString(),
        hardCap: hardCap.toString(),
        totalRaised: totalRaised.toString()
      });

      return {
        startTime: startTime.toNumber(),
        endTime: endTime.toNumber(),
        tokenPrice: ethers.utils.formatEther(tokenPrice),
        hardCap: ethers.utils.formatEther(hardCap),
        totalRaised: ethers.utils.formatEther(totalRaised),
        isActive: Date.now() / 1000 >= startTime.toNumber() && 
                 Date.now() / 1000 <= endTime.toNumber()
      };
    } catch (error) {
      console.error('Error getting ICO status:', error);
      throw error;
    }
  }

  async buyTokens(amount) {
    try {
      const value = ethers.utils.parseEther(amount);
      
      console.log('Sending transaction with:', {
        amount,
        value: value.toString(),
        method: 'buyTokens'
      });

      // Call buyTokens with the value parameter
      const tx = await this.contracts.ico.buyTokens({ 
        value: value
      });

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      return receipt;
    } catch (error) {
      // Get the revert reason if available
      if (error.data) {
        const reason = error.data.message || error.message;
        console.error('Transaction failed with reason:', reason);
      }
      console.error('Detailed buy tokens error:', error);
      throw error;
    }
  }

  async getAddress() {
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Error getting address:', error);
      throw error;
    }
  }

  async getTokenBalance(address) {
    try {
      const balance = await this.contracts.token.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }
}

const web3Service = new Web3Service();
export default web3Service;

