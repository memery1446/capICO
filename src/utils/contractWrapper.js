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

  // Add explicit balanceOf method to the base contract
  baseContract.balanceOf = async (address) => {
    try {
      const [locked, vesting] = await Promise.all([
        icoContract.lockedTokens(address),
        icoContract.vestingSchedules(address)
      ]);

      const vestingAmount = vesting && vesting.totalAmount ? 
        vesting.totalAmount : ethers.BigNumber.from(0);

      return locked.add(vestingAmount);
    } catch (error) {
      console.error('Error in balanceOf:', error);
      return ethers.BigNumber.from(0);
    }
  };

  // Add ERC20 methods directly to base contract
  ['name', 'symbol', 'decimals', 'totalSupply'].forEach(method => {
    baseContract[method] = (...args) => tokenContract[method](...args);
  });

  // Return proxied contract
  return new Proxy(baseContract, {
    get(target, prop) {
      // First check if property exists on our wrapped contract
      if (prop in target) {
        return target[prop];
      }

      // Then check ICO contract
      if (prop in icoContract) {
        return icoContract[prop];
      }

      // Finally check token contract
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
  });
}

