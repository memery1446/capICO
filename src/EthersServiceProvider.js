// EthersServiceProvider.js
import { ethers } from 'ethers';
import { ICO_ADDRESS, TOKEN_ADDRESS } from './contracts/addresses';  // Updated path
import CapICO from './contracts/CapICO.json';                       // Updated path
import ICOToken from './contracts/ICOToken.json';                   // Updated path

export function createEthersService(provider) {
  if (!provider) {
    throw new Error('Provider is required');
  }

  const signer = provider.getSigner();
  const icoContract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ICOToken.abi, signer);

  const service = {
    icoContract,
    tokenContract,
    
    // Core balance functionality
    async getBalance(address) {
      try {
        const [locked, vesting] = await Promise.all([
          icoContract.lockedTokens(address),
          icoContract.vestingSchedules(address)
        ]);
        
        const vestingAmount = vesting && vesting.totalAmount ? 
          vesting.totalAmount : ethers.BigNumber.from(0);
          
        return locked.add(vestingAmount);
      } catch (error) {
        console.error('Error getting balance:', error);
        return ethers.BigNumber.from(0);
      }
    },

    // Standard token info
    name: () => tokenContract.name(),
    symbol: () => tokenContract.symbol(),
    decimals: () => tokenContract.decimals(),
    totalSupply: () => tokenContract.totalSupply(),

    // Purchase functionality
    buyTokens: async (amount) => {
      const tx = await icoContract.buyTokens({ value: amount });
      return tx.wait();
    }
  };

  // Add balanceOf as a direct property
  service.balanceOf = service.getBalance;

  return service;
}

