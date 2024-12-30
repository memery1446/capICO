// src/redux/actions.js
import { ethers } from 'ethers';
import { setLoading, setError, setContracts, updateICOData } from './contractSlice';
import { setAccount, setBalances } from './userSlice';
import TokenArtifact from '../artifacts/contracts/Token.sol/Token.json';
import CapICOArtifact from '../artifacts/contracts/CapICO.sol/CapICO.json';

const CONTRACT_ADDRESSES = {
  TOKEN: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
  ICO: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const initializeBlockchain = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    if (!window.ethereum) {
      throw new Error('Please install MetaMask to use this application');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    
    // Wait for blockchain to stabilize
    await delay(1000);

    // Initialize contracts
    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TOKEN,
      TokenArtifact.abi,
      signer
    );
    
    const icoContract = new ethers.Contract(
      CONTRACT_ADDRESSES.ICO,
      CapICOArtifact.abi,
      signer
    );

    // Store contracts and account
    dispatch(setContracts({ token: tokenContract, ico: icoContract }));
    dispatch(setAccount(account));

    // Get basic balance info
    const balance = await provider.getBalance(account);
    dispatch(setBalances({
      eth: ethers.utils.formatEther(balance),
      tokens: '0' // We'll update this later
    }));

    // Load minimal ICO data
    const [tokenPrice, hardCap] = await Promise.all([
      icoContract.tokenPrice(),
      icoContract.hardCap()
    ]);

    dispatch(updateICOData({
      tokenPrice: ethers.utils.formatEther(tokenPrice),
      hardCap: ethers.utils.formatEther(hardCap),
      softCap: '0',
      minInvestment: '0',
      maxInvestment: '0',
      totalRaised: '0',
      totalTokensSold: '0'
    }));

  } catch (error) {
    console.error('Initialization error:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};