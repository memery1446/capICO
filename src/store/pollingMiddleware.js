import { ethers } from 'ethers';
import { ICO_ADDRESS } from '../contracts/addresses';
import CapICO from '../contracts/CapICO.json';
import { updateICOInfo } from './icoSlice';

const pollingMiddleware = store => next => action => {
  if (action.type === 'START_POLLING') {
    const pollInterval = setInterval(async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(ICO_ADDRESS, CapICO.abi, provider);

          const [
            isActive,
            cooldownEnabled,
            vestingEnabled,
            totalRaised,
            hardCap,
            tokenPrice,
            tokenAddress,
          ] = await Promise.all([
            contract.isActive(),
            contract.cooldownEnabled(),
            contract.vestingEnabled(),
            contract.totalRaised(),
            contract.hardCap(),
            contract.getCurrentTokenPrice(),
            contract.token(),
          ]);

          const tokenContract = new ethers.Contract(
            tokenAddress,
            ['function name() view returns (string)', 'function symbol() view returns (string)', 'function totalSupply() view returns (uint256)', 'function balanceOf(address) view returns (uint256)'],
            provider
          );

          const [tokenName, tokenSymbol, totalSupply] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.totalSupply(),
          ]);

          const signer = provider.getSigner();
          const address = await signer.getAddress();
          const tokenBalance = await tokenContract.balanceOf(address);

          store.dispatch(updateICOInfo({
            isActive,
            cooldownEnabled,
            vestingEnabled,
            totalRaised: ethers.utils.formatEther(totalRaised),
            hardCap: ethers.utils.formatEther(hardCap),
            tokenPrice: ethers.utils.formatEther(tokenPrice),
            tokenName,
            tokenSymbol,
            tokenBalance: ethers.utils.formatEther(tokenBalance),
            totalSupply: ethers.utils.formatEther(totalSupply),
          }));
        } catch (error) {
          console.error('Polling error:', error);
          // Dispatch an error action here if needed
        }
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(pollInterval);
  }
  return next(action);
};

export default pollingMiddleware;

