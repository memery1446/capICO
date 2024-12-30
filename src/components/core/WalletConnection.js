// src/components/core/WalletConnection.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { setAccount, setBalances } from '../../redux/userSlice';
import { setContracts } from '../../redux/contractSlice';

const WalletConnection = () => {
  const dispatch = useDispatch();
  const { account } = useSelector(state => state.user);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (err) {
          console.error('Failed to check wallet connection:', err);
        }
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      dispatch(setAccount(null));
    } else if (accounts[0] !== account) {
      // Account changed
      connectWallet();
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to use this application.');
      return;
    }

    try {
      setError('');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Get account balance
      const balance = await provider.getBalance(accounts[0]);
      
      // Set up contract instances
      // Note: You'll need to import your contract ABIs and addresses
      const icoContract = new ethers.Contract(ICO_ADDRESS, ICO_ABI, signer);
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      
      // Get token balance
      const tokenBalance = await tokenContract.balanceOf(accounts[0]);

      // Update Redux state
      dispatch(setAccount(accounts[0]));
      dispatch(setBalances({
        eth: ethers.utils.formatEther(balance),
        tokens: ethers.utils.formatEther(tokenBalance)
      }));
      dispatch(setContracts({
        ico: icoContract,
        token: tokenContract
      }));

    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    }
  };

  return (
    <div>
      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="bg-green-500 h-2 w-2 rounded-full"></div>
          <span className="text-sm">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletConnection;

