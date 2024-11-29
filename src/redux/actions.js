import { ethers } from 'ethers';
import { setLoading, setError } from './blockchainSlice';
import { updateICOData } from './icoSlice'; 
import { setAccountData } from './accountSlice';

import CAPICO_ABI from '../abis/CapICO.json';
import TOKEN_ABI from '../abis/Token.json';
import { CAPICO_ADDRESS, TOKEN_ADDRESS } from '../config';

console.log('CapICO Contract Address:', CAPICO_ADDRESS);
console.log('Token Contract Address:', TOKEN_ADDRESS);

export const loadBlockchainData = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log('Provider:', provider);
    console.log('Network:', await provider.getNetwork());

    const signer = provider.getSigner();
    
    console.log('Creating contract instances...');
    const capicoContract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, signer);
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

    console.log('Checking if contracts exist at specified addresses...');
    const capicoCode = await provider.getCode(CAPICO_ADDRESS);
    const tokenCode = await provider.getCode(TOKEN_ADDRESS);
    console.log('CapICO contract code:', capicoCode);
    console.log('Token contract code:', tokenCode);
    if (capicoCode === '0x' || tokenCode === '0x') {
      throw new Error('One or more contracts do not exist at the specified addresses');
    }

    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const balance = ethers.utils.formatEther(await provider.getBalance(account));

    dispatch(setAccountData({ account, balance }));

    let currentTier, totalTokensSold, softCap, currentPrice, tokenBalance;

    try {
      console.log('Fetching currentTier...');
      currentTier = (await capicoContract.currentTier()).toString();
      console.log('Current Tier:', currentTier);
    } catch (error) {
      console.error('Error fetching currentTier:', error);
      currentTier = 'N/A';
    }

    try {
      console.log('Fetching totalTokensSold...');
      totalTokensSold = ethers.utils.formatEther(await capicoContract.totalTokensSold());
      console.log('Total Tokens Sold:', totalTokensSold);
    } catch (error) {
      console.error('Error fetching totalTokensSold:', error);
      totalTokensSold = 'N/A';
    }

    try {
      console.log('Fetching softCap...');
      softCap = ethers.utils.formatEther(await capicoContract.softCap());
      console.log('Soft Cap:', softCap);
    } catch (error) {
      console.error('Error fetching softCap:', error);
      softCap = 'N/A';
    }

    try {
      console.log('Fetching currentPrice...');
      const currentTierInfo = await capicoContract.getCurrentTier();
      currentPrice = ethers.utils.formatEther(currentTierInfo.price);
      console.log('Current Price:', currentPrice);
    } catch (error) {
      console.error('Error fetching currentPrice:', error);
      currentPrice = 'N/A';
    }

    try {
      console.log('Fetching token balance...');
      tokenBalance = ethers.utils.formatEther(await tokenContract.balanceOf(account));
      console.log('Token Balance:', tokenBalance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      tokenBalance = 'N/A';
    }

    dispatch(updateICOData({ currentTier, totalTokensSold, softCap, currentPrice, tokenBalance }));
    dispatch(setLoading(false));
  } catch (error) {
    console.error('Error in loadBlockchainData:', error);
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export const buyTokens = (amount) => async (dispatch, getState) => {
  const { account } = getState().account;
  const { currentPrice } = getState().ico;

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    const capicoContract = new ethers.Contract(CAPICO_ADDRESS, CAPICO_ABI, signer);

    const value = ethers.utils.parseEther((parseFloat(amount) * parseFloat(currentPrice)).toString());
    const tx = await capicoContract.buyTokens(ethers.utils.parseEther(amount), { value });
    await tx.wait();

    dispatch(loadBlockchainData());
  } catch (error) {
    console.error('Error in buyTokens:', error);
    dispatch(setError(error.message));
  }
};
