import { ethers } from 'ethers';
import { ICO_ADDRESS, TOKEN_ADDRESS } from './contracts/addresses';
import CapICO from './contracts/CapICO.json';
import ICOToken from './contracts/ICOToken.json';
import { Interface } from '@ethersproject/abi';

export async function createEthersService(provider) {
  if (!provider) {
    throw new Error('Provider is required');
  }

  // Create Alchemy provider for read operations
  const readProvider = new ethers.providers.JsonRpcProvider(
    "https://eth-sepolia.g.alchemy.com/v2/ehS_FNG7PZdI8QnwGIukVMfXqf4CN2Vk",
    {
      name: 'sepolia',
      chainId: 11155111
    }
  );

  const signer = provider.getSigner();
  const icoContract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ICOToken.abi, signer);

  // Create read-only contract instance
  const readOnlyContract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, readProvider);

  const service = {
    provider,
    icoContract,
    tokenContract,
    
    // Enhanced balance functionality
    balanceOf: async (address) => {
      try {
        const [locked, vesting, tokenBalance] = await Promise.all([
          icoContract.lockedTokens(address),
          icoContract.vestingSchedules(address),
          tokenContract.balanceOf(address)
        ]);
        
        const vestingAmount = vesting && vesting.totalAmount ? 
          vesting.totalAmount.sub(vesting.releasedAmount) : 
          ethers.BigNumber.from(0);
          
        return locked.add(vestingAmount).add(tokenBalance);
      } catch (error) {
        console.error('Error in balanceOf:', error);
        return ethers.BigNumber.from(0);
      }
    },

    // Add enhanced queryFilter with fallback
    queryTransactionEvents: async (address) => {
      try {
        // Try with read provider first
        const filter = readOnlyContract.filters.TokensPurchased(address);
        const latestBlock = await readProvider.getBlockNumber();
        const fromBlock = Math.max(0, latestBlock - 1000); // Last 1000 blocks
        return await readOnlyContract.queryFilter(filter, fromBlock, latestBlock);
      } catch (error) {
        console.error('Error querying events with read provider:', error);
        // Fallback to regular provider (useful for testing and local chains)
        const filter = icoContract.filters.TokensPurchased(address);
        return await icoContract.queryFilter(filter);
      }
    },

    // Core purchase functionality
    buyTokens: async (amount) => {
      const tx = await icoContract.buyTokens({ value: amount });
      return tx.wait();
    },

    // Transaction history functionality
    queryTransactionEvents: async (address) => {
      try {
        const iface = new Interface(CapICO.abi);
        const filter = {
          address: ICO_ADDRESS,
          fromBlock: 0,
          toBlock: 'latest',
          topics: [
            iface.getEventTopic('TokensPurchased'),
            ethers.utils.hexZeroPad(address, 32)
          ]
        };

        const logs = await provider.getLogs(filter);
        return logs.map(log => {
          const parsedLog = iface.parseLog(log);
          return {
            ...log,
            args: parsedLog.args
          };
        });
      } catch (error) {
        console.error('Error querying events:', error);
        return [];
      }
    },

    getBlock: async (blockNumber) => {
      return provider.getBlock(blockNumber);
    },

    // Existing functionality
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
    // Add getBlock helper that uses read provider
    getBlock: (blockNumber) => readProvider.getBlock(blockNumber)
  };

  return service;
}

