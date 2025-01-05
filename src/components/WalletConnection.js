import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { setWalletConnection, resetReferralState } from '../store/referralSlice';

const WalletConnection = () => {
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const isWalletConnected = useSelector((state) => state.referral.isWalletConnected);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        await signer.getAddress(); // Ensure we can get the address
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

  const disconnectWallet = () => {
    dispatch(setWalletConnection(false));
    dispatch(resetReferralState());
  };

  return (
    <div className="bg-white shadow-md rounded-lg w-full max-w-md mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Wallet Connection</h3>
        <p className="mt-1 text-sm text-gray-600">
          Connect your wallet to interact with the ICO
        </p>
      </div>
      <div className="px-6 py-4">
        {isWalletConnected ? (
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
          >
            Connect Wallet
          </button>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default WalletConnection;

