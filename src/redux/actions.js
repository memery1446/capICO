import { ethers } from 'ethers';
import { setLoading, setError } from './blockchainSlice';
import { updateICOData } from './icoSlice';
import { setAccountData } from './accountSlice';
import { setTokenBalance } from './userSlice';
import { addNotification, removeNotification as removeNotificationAction } from './uiSlice';
import { TOKEN_ADDRESS, TOKEN_ABI, CAPICO_ADDRESS, CAPICO_ABI } from '../config';

export const loadBlockchainData = () => async (dispatch) => {
  dispatch(setLoading(true));
  console.log('Starting blockchain load');
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    const account = accounts[0];
    
    if (account) {
      const balance = await provider.getBalance(account);
      dispatch(setAccountData({ 
        account, 
        balance: ethers.utils.formatEther(balance) 
      }));

      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const tokenBalance = await tokenContract.balanceOf(account);
      dispatch(setTokenBalance(ethers.utils.formatEther(tokenBalance)));
    }

    const capicoContract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, provider);
    
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

// Add these right after the Promise.all([...]) call
console.log('ICO Status Raw:', icoStatus);
console.log('Current Time:', icoStatus.currentTime.toString());
console.log('Remaining Time:', icoStatus.remainingTime.toString());

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
    remainingTime: icoStatus.remainingTime.toString() // Remove the hex parsing since it's already a BigNumber
  }
}));

    dispatch(setLoading(false));
  } catch (error) {
    console.error('LoadBlockchainData error:', error);
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export const buyTokens = (amount) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const capicoContract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, signer);
    
    const tokenPrice = await capicoContract.tokenPrice();
    const cost = ethers.utils.parseEther((parseFloat(amount) * parseFloat(ethers.utils.formatEther(tokenPrice))).toFixed(18));
    const tx = await capicoContract.buyTokens(ethers.utils.parseEther(amount), { value: cost });
    
    dispatch(addNotification({
      type: 'info',
      message: 'Transaction submitted. Waiting for confirmation...',
      title: 'Transaction Pending'
    }));

    await tx.wait();

    dispatch(addNotification({
      type: 'success',
      message: `Successfully purchased ${amount} tokens`,
      title: 'Purchase Complete'
    }));

    dispatch(loadBlockchainData());
  } catch (error) {
    console.error('Error in buyTokens:', error);
    dispatch(setError(error.message));
    dispatch(addNotification({
      type: 'error',
      message: error.message || 'Failed to purchase tokens',
      title: 'Purchase Failed'
    }));
  } finally {
    dispatch(setLoading(false));
  }
};

export const connectWallet = () => async (dispatch) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    
    dispatch(setAccountData({ 
      account: address, 
      balance: ethers.utils.formatEther(balance) 
    }));

    dispatch(loadBlockchainData());
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    dispatch(addNotification({
      type: 'error',
      message: 'Failed to connect wallet',
      title: 'Error'
    }));
  }
};

export const disconnectWallet = () => (dispatch) => {
  dispatch(setAccountData({ account: null, balance: '0' }));
  dispatch(setTokenBalance('0'));
};

export const removeNotification = (index) => (dispatch) => {
  dispatch(removeNotificationAction(index));
};

export const loadUserData = (account) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
    const capicoContract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, provider);

    const [tokenBalance, ethBalance, investments] = await Promise.all([
      tokenContract.balanceOf(account),
      provider.getBalance(account),
      capicoContract.investments(account)
    ]);

    dispatch(setTokenBalance(ethers.utils.formatEther(tokenBalance)));
    dispatch(setAccountData({
      account,
      balance: ethers.utils.formatEther(ethBalance)
    }));

    // You might want to store the investments data in a separate slice
    // For now, we'll just log it
    console.log('User investments:', ethers.utils.formatEther(investments));

    dispatch(setLoading(false));
  } catch (error) {
    console.error('Error loading user data:', error);
    dispatch(setError(error.message));
    dispatch(addNotification({
      type: 'error',
      message: 'Failed to load user data',
      title: 'Error'
    }));
    dispatch(setLoading(false));
  }
};

export const updateICOParams = (params) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const capicoContract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, signer);
    
    // Assuming updateICOParameters is a function in your smart contract
    const tx = await capicoContract.updateICOParameters(
      ethers.utils.parseEther(params.tokenPrice),
      ethers.utils.parseEther(params.softCap),
      ethers.utils.parseEther(params.hardCap),
      Math.floor(new Date(params.startDate).getTime() / 1000),
      Math.floor(new Date(params.endDate).getTime() / 1000)
    );
    
    await tx.wait();
    
    dispatch(addNotification({
      type: 'success',
      message: 'ICO parameters updated successfully',
      title: 'Update Successful'
    }));
    
    dispatch(loadBlockchainData());
  } catch (error) {
    console.error('Error updating ICO parameters:', error);
    dispatch(setError(error.message));
    dispatch(addNotification({
      type: 'error',
      message: 'Failed to update ICO parameters',
      title: 'Update Failed'
    }));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateWhitelist = (addresses) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const capicoContract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, signer);
    
    const tx = await capicoContract.updateWhitelist(addresses, true);
    await tx.wait();
    
    dispatch(addNotification({
      type: 'success',
      message: 'Whitelist updated successfully',
      title: 'Whitelist Update'
    }));
    
    dispatch(setLoading(false));
  } catch (error) {
    console.error('Error updating whitelist:', error);
    dispatch(setError(error.message));
    dispatch(addNotification({
      type: 'error',
      message: 'Failed to update whitelist',
      title: 'Error'
    }));
    dispatch(setLoading(false));
  }
};

export const fetchVestingSchedule = (account) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const capicoContract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, provider);
    
    // Get the user's total investment
    const investment = await capicoContract.investments(account);
    
    // Get the token price
    const tokenPrice = await capicoContract.tokenPrice();
    
    // Calculate the total tokens bought (investment / tokenPrice)
    const totalTokens = investment.mul(ethers.utils.parseEther('1')).div(tokenPrice);
    
    // Calculate distributions
    const immediateDistribution = totalTokens.div(2);
    const delayedDistribution = totalTokens.div(4);
    
    // Get the current timestamp and ICO start time
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = (await capicoContract.startTime()).toNumber();
    
    // Create the vesting schedule
    const vestingSchedule = [
      {
        releaseDate: new Date(startTime * 1000).toISOString(),
        percentage: 50,
        amount: ethers.utils.formatEther(immediateDistribution),
        released: true
      },
      {
        releaseDate: new Date((startTime + 30 * 24 * 60 * 60) * 1000).toISOString(),
        percentage: 25,
        amount: ethers.utils.formatEther(delayedDistribution),
        released: currentTime > (startTime + 30 * 24 * 60 * 60)
      },
      {
        releaseDate: new Date((startTime + 60 * 24 * 60 * 60) * 1000).toISOString(),
        percentage: 25,
        amount: ethers.utils.formatEther(delayedDistribution),
        released: currentTime > (startTime + 60 * 24 * 60 * 60)
      }
    ];

    dispatch(setLoading(false));
    return vestingSchedule;
  } catch (error) {
    console.error('Error fetching vesting schedule:', error);
    dispatch(setError('Failed to fetch vesting schedule'));
    dispatch(setLoading(false));
    throw error;
  }
};

const actions = {
  loadBlockchainData,
  buyTokens,
  connectWallet,
  disconnectWallet,
  removeNotification,
  loadUserData,
  updateICOParams,
  fetchVestingSchedule,
};

export default actions;

