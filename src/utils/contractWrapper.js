import { ethers } from 'ethers';
import { ICO_ADDRESS, TOKEN_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import ICOToken from '../contracts/ICOToken.json';

export function createContractWrapper(provider) {
  if (!provider) {
    throw new Error('Provider is required');
  }

  const signer = provider.getSigner();
  const icoContract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, signer);
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ICOToken.abi, signer);

  // Create base wrapped contract with core ICO functionality
  const baseContract = Object.create(icoContract);

  // Add explicit balanceOf method to handle all token balance types
  baseContract.balanceOf = async (address) => {
    try {
      // Get locked tokens from ICO contract
      const locked = await icoContract.lockedTokens(address);
      
      // Get vesting schedule details
      const vesting = await icoContract.vestingSchedules(address);
      const vestingAmount = vesting && vesting.totalAmount ? 
        vesting.totalAmount.sub(vesting.releasedAmount) : // Only count unreleased tokens
        ethers.BigNumber.from(0);
      
      // Get regular token balance from ERC20 contract
      const tokenBalance = await tokenContract.balanceOf(address);

      // Sum all balances
      return locked.add(vestingAmount).add(tokenBalance);
    } catch (error) {
      console.error('Error in balanceOf:', error);
      return ethers.BigNumber.from(0);
    }
  };

  // Add token contract methods
  ['name', 'symbol', 'decimals', 'totalSupply'].forEach(method => {
    baseContract[method] = (...args) => tokenContract[method](...args);
  });

  // Create proxy handler with proper method forwarding
  const handler = {
    get(target, prop) {
      // Check if property exists on our wrapped contract
      if (prop in target) {
        return target[prop];
      }

      // Check ICO contract
      if (prop in icoContract) {
        // Special case for balanceOf
        if (prop === 'balanceOf') {
          return target.balanceOf;
        }
        return icoContract[prop];
      }

      // Check token contract
      if (prop in tokenContract) {
        return tokenContract[prop];
      }

      return undefined;
    },
    has(target, prop) {
      return prop in target || 
             prop in icoContract || 
             prop in tokenContract;
    }
  };

  // Attach original contracts for direct access 
  baseContract._icoContract = icoContract;
  baseContract._tokenContract = tokenContract;

  // Return proxied contract
  return new Proxy(baseContract, handler);
}


