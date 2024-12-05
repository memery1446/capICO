import { ethers } from 'ethers';
import { setLoading, setError } from './blockchainSlice';
import { updateICOData } from './icoSlice'; 
import { setAccountData } from './accountSlice';
import { setTokenBalance } from './userSlice';
import { setLoading as setUILoading, addNotification } from './uiSlice';
import { CAPICO_ADDRESS, CAPICO_ABI } from '../config';

export const loadBlockchainData = () => async (dispatch) => {
  dispatch(setLoading(true));
  console.log('Starting blockchain load');
  
  try {
    // 1. Get base connection
    console.log('Attempting to connect to Web3Provider');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log('Web3Provider connected');

    console.log('Requesting accounts');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log('Accounts received:', accounts);
    const account = accounts[0];
    
    // 2. Set basic account data
    console.log('Fetching account balance');
    const balance = await provider.getBalance(account);
    console.log('Account balance:', ethers.utils.formatEther(balance));
    dispatch(setAccountData({ 
      account, 
      balance: ethers.utils.formatEther(balance) 
    }));

    // 3. Contract connection
    console.log('Connecting to contract at address:', CAPICO_ADDRESS);
    const signer = provider.getSigner();
    const capicoContract = new ethers.Contract(
      CAPICO_ADDRESS,
      CAPICO_ABI,
      signer
    );
    console.log('Contract connected');

    // 4. Fetch ICO data
    console.log('Fetching ICO data');
    const [
      tokenPrice,
      softCap,
      hardCap,
      totalRaised,
      totalTokensSold,
      minInvestment,
      maxInvestment,
      icoStatus
    ] = await Promise.all([
      capicoContract.tokenPrice(),
      capicoContract.softCap(),
      capicoContract.hardCap(),
      capicoContract.totalRaised(),
      capicoContract.totalTokensSold(),
      capicoContract.minInvestment(),
      capicoContract.maxInvestment(),
      capicoContract.getICOStatus()
    ]);
    console.log('ICO data fetched successfully');

    // 5. Dispatch ICO data
    console.log('Dispatching ICO data to store');
    dispatch(updateICOData({
      tokenPrice: ethers.utils.formatEther(tokenPrice),
      softCap: ethers.utils.formatEther(softCap),
      hardCap: ethers.utils.formatEther(hardCap),
      totalRaised: ethers.utils.formatEther(totalRaised),
      totalTokensSold: ethers.utils.formatEther(totalTokensSold),
      minInvestment: ethers.utils.formatEther(minInvestment),
      maxInvestment: ethers.utils.formatEther(maxInvestment),
      status: {
        isActive: icoStatus.isActive,
        hasStarted: icoStatus.hasStarted,
        hasEnded: icoStatus.hasEnded,
        currentTime: icoStatus.currentTime.toString(),
        remainingTime: icoStatus.remainingTime.toString()
      }
    }));

    console.log('Blockchain data loaded successfully');
    dispatch(setLoading(false));
  } catch (error) {
    console.error('LoadBlockchainData error:', error);
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export const buyTokens = (amount) => async (dispatch) => {
  console.log('Starting buyTokens with amount:', amount);
  dispatch(setLoading(true));
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    const capicoContract = new ethers.Contract(
      CAPICO_ADDRESS,
      CAPICO_ABI,
      signer
    );
    
    // Get token price
    const tokenPrice = await capicoContract.tokenPrice();
    console.log('Token price:', ethers.utils.formatEther(tokenPrice));
    
    // Calculate cost in ETH
    const cost = (parseFloat(amount) * parseFloat(ethers.utils.formatEther(tokenPrice))).toString();
    const costInWei = ethers.utils.parseEther(cost);
    const tokenAmount = ethers.utils.parseEther(amount.toString());

    console.log('Sending transaction with:', {
      tokenAmount: tokenAmount.toString(),
      cost: costInWei.toString()
    });

    // Buy tokens
    const tx = await capicoContract.buyTokens(tokenAmount, { value: costInWei });
    console.log('Transaction sent:', tx.hash);
    
    dispatch(addNotification({
      type: 'info',
      message: 'Transaction submitted. Waiting for confirmation...',
      title: 'Transaction Pending'
    }));

    await tx.wait();
    console.log('Transaction confirmed');

    dispatch(addNotification({
      type: 'success',
      message: `Successfully purchased ${amount} tokens`,
      title: 'Purchase Complete'
    }));

    // Reload blockchain data to update balances and ICO status
    dispatch(loadBlockchainData());

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
    dispatch(setLoading(false));
  }
};

export const fetchUserTokenBalance = (account) => async (dispatch) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, provider);
    const balance = await contract.balanceOf(account);
    dispatch(setTokenBalance(ethers.utils.formatEther(balance)));
  } catch (error) {
    console.error('Error fetching token balance:', error);
    dispatch(setError(error.message));
  }
};

export const loadUserData = (account) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(account);
    dispatch(setAccountData({ 
      account, 
      balance: ethers.utils.formatEther(balance) 
    }));
    dispatch(fetchUserTokenBalance(account));
  } catch (error) {
    console.error('LoadUserData error:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateICOParams = (params) => async (dispatch) => {
  // Implement the logic to update ICO parameters
  console.log('Updating ICO parameters:', params);
  // You would typically make an API call here to update the parameters on the blockchain
  // For now, we'll just dispatch an action to update the state
  dispatch(updateICOData(params));
};

const actions = {
  loadBlockchainData,
  buyTokens,
  loadUserData,
  fetchUserTokenBalance,
  updateICOParams
};

export default actions;

