import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { setWalletConnection, resetReferralState } from '../store/referralSlice';

const WalletConnection = () => {
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const dispatch = useDispatch();
  const isWalletConnected = useSelector((state) => state.referral.isWalletConnected);

  // Check for existing connection on load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const balance = await provider.getBalance(accounts[0]);
            setAddress(accounts[0]);
            setBalance(ethers.utils.formatEther(balance));
            dispatch(setWalletConnection(true));
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          dispatch(setWalletConnection(true));
        } else {
          handleDisconnect();
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleDisconnect);
      }
    };
  }, [dispatch]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(accounts[0]);
        
        setAddress(accounts[0]);
        setBalance(ethers.utils.formatEther(balance));
        dispatch(setWalletConnection(true));
        setError('');
      } catch (err) {
        setError('Failed to connect wallet. Please try again.');
        console.error('Error connecting wallet:', err);
      }
    } else {
      setError('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const handleDisconnect = () => {
    setAddress('');
    setBalance('');
    dispatch(setWalletConnection(false));
    dispatch(resetReferralState());
  };

  return (
    <div className="bg-white shadow-md rounded-lg w-full max-w-md mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Wallet Connection</h3>
        <p className="mt-1 text-sm text-gray-600">
          {isWalletConnected 
            ? 'Your wallet is connected' 
            : 'Connect your wallet to interact with the ICO'}
        </p>
      </div>
      <div className="px-6 py-4">
        {isWalletConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Connected Address</span>
                <span className="font-mono">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                </span>
              </div>
              {balance && (
                <div className="text-right">
                  <span className="text-sm text-gray-600">Balance</span>
                  <p className="font-medium">{parseFloat(balance).toFixed(4)} ETH</p>
                </div>
              )}
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 transition duration-150"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="w-full px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 transition duration-150"
          >
            Connect Wallet
          </button>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnection;

