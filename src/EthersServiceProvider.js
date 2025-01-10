import { ethers } from 'ethers';
import { ICO_ADDRESS, TOKEN_ADDRESS } from './contracts/addresses';
import CapICO from './contracts/CapICO.json';
import ICOToken from './contracts/ICOToken.json';

export async function createEthersService(provider) {
  if (!provider) {
    throw new Error('Provider is required');
  }

  const signer = provider.getSigner();
  const icoContract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ICOToken.abi, signer);

  const service = {
    provider,
    icoContract,
    tokenContract,
    
    // Core purchase functionality - simplified to just handle the transaction
    buyTokens: async (amount) => {
      const tx = await icoContract.buyTokens({ value: amount });
      await tx.wait();
      // Let polling handle the balance update
      return true;
    },

    // Rest of existing functionality
    getCurrentTokenPrice: () => icoContract.getCurrentTokenPrice(),
    calculateTokenAmount: (weiAmount, tokenPrice) => 
      icoContract.calculateTokenAmount(weiAmount, tokenPrice),
    getTierCount: () => icoContract.getTierCount(),
    getTier: (index) => icoContract.getTier(index),
    cooldownTimeLeft: (address) => icoContract.cooldownTimeLeft(address),
    setReferrer: (referrer) => icoContract.setReferrer(referrer),
    claimReferralBonus: () => icoContract.claimReferralBonus(),
    releaseVestedTokens: () => icoContract.releaseVestedTokens(),
    unlockTokens: () => icoContract.unlockTokens(),
    isActive: () => icoContract.isActive(),
    cooldownEnabled: () => icoContract.cooldownEnabled(),
    vestingEnabled: () => icoContract.vestingEnabled(),
    hardCap: () => icoContract.hardCap(),
    totalRaised: () => icoContract.totalRaised(),
    icoStartTime: () => icoContract.icoStartTime(),
    name: () => tokenContract.name(),
    symbol: () => tokenContract.symbol(),
    decimals: () => tokenContract.decimals(),
    totalSupply: () => tokenContract.totalSupply(),
    getSignerAddress: () => signer.getAddress(),
  };

  return service;
}

