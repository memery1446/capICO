import React, { useState } from 'react';
import { ethers } from 'ethers';

const ConnectWallet = ({ onConnect }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const balance = await provider.getBalance(address);
        setBalance(ethers.utils.formatEther(balance));

        onConnect(true);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        onConnect(false);
      }
    } else {
      console.error('MetaMask is not installed');
      onConnect(false);
    }
  };

  return (
    <div>
      {account ? (
        <div>
          <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          <p>Balance: {parseFloat(balance).toFixed(4)} ETH</p>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default ConnectWallet;

