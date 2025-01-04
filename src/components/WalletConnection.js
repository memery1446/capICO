import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Button from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

const WalletConnection = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (account) {
      updateBalance();
    }
  }, [account]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setError(null);
      } catch (err) {
        setError('Failed to connect wallet. Please try again.');
        console.error('Error connecting wallet:', err);
      }
    } else {
      setError('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const updateBalance = async () => {
    if (account) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(balance));
      } catch (err) {
        console.error('Error fetching balance:', err);
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
        <CardDescription>Connect your wallet to interact with the ICO</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center space-x-2 text-red-600 mb-4">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}
        {account ? (
          <div>
            <div className="flex items-center space-x-2 text-green-600 mb-4">
              <span>✅</span>
              <p>Wallet connected</p>
            </div>
            <p className="mb-2">Address: {`${account.slice(0, 6)}...${account.slice(-4)}`}</p>
            <p className="mb-4">Balance: {balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}</p>
            <Button onClick={disconnectWallet} variant="outline">Disconnect Wallet</Button>
          </div>
        ) : (
          <Button onClick={connectWallet}>Connect Wallet</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnection;

