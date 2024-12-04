import { ethers } from 'ethers';
import { setLoading, setError } from './blockchainSlice';
import { updateICOStatus, updateICOData } from './icoSlice'; 
import { setAccountData } from './accountSlice';
import { setLoading as setUILoading, addNotification } from './uiSlice';
import { CAPICO_ADDRESS, CAPICO_ABI, TOKEN_ADDRESS, TOKEN_ABI } from '../config';

export const loadBlockchainData = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }

    // Get and log chain ID details
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    
    console.log('Chain ID Details:', {
      metaMaskChainId: parseInt(chainId, 16),
      providerChainId: network.chainId,
      expectedChainId: 1337, // Hardhat's default
      networkName: network.name
    });

    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log('Connected Address:', signerAddress);

    const [account] = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    const balance = ethers.utils.formatEther(await provider.getBalance(account));

    dispatch(setAccountData({ account, balance }));
    dispatch(setLoading(false));
    
    return { provider, signer };

  } catch (error) {
    console.error('Blockchain loading error:', {
      message: error.message,
      code: error.code,
      data: error.data
    });
    dispatch(setError(error.message));
    dispatch(setLoading(false));
    throw error;
  }
};

// Re-add buyTokens to fix the TokenPurchase import error
export const buyTokens = (amount) => async (dispatch) => {
  dispatch(setUILoading({ type: 'purchase', isLoading: true }));
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    const capicoContract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, signer);
    
    const tokenPrice = await capicoContract.tokenPrice();
    const cost = (parseFloat(amount) * parseFloat(ethers.utils.formatEther(tokenPrice))).toString();
    const costInWei = ethers.utils.parseEther(cost);
    const tokenAmount = ethers.utils.parseEther(amount.toString());

    const tx = await capicoContract.buyTokens(tokenAmount, { value: costInWei });
    
    await tx.wait();

    dispatch(addNotification({
      type: 'success',
      message: `Successfully purchased ${amount} tokens`,
      title: 'Purchase Complete'
    }));

    return tx;
  } catch (error) {
    console.error('Error in buyTokens:', error);
    dispatch(setError(error.message));
    dispatch(addNotification({
      type: 'error',
      message: error.message || 'Failed to purchase tokens',
      title: 'Purchase Failed'
    }));
    throw error;
  } finally {
    dispatch(setUILoading({ type: 'purchase', isLoading: false }));
  }
};

export default {
  loadBlockchainData,
  buyTokens
};