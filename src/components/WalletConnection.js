import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';

const WalletButton = styled.button`
  background-color: #043927;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;

  &:hover {
    background-color: #032a1e;
  }
`;

const WalletInfo = styled.div`
  background-color: #2a2a2a;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
`;

export default function WalletConnection({ onConnect }) {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        await updateBalance(address);
        if (onConnect) {
          onConnect(address);
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    } else {
      alert("Please install MetaMask to use this feature!");
    }
  };

  const updateBalance = async (address) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(address);
    setBalance(ethers.utils.formatEther(balance));
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    if (onConnect) {
      onConnect(null);
    }
  };

  return (
    <div>
      {!account ? (
        <WalletButton onClick={connectWallet}>Connect Wallet</WalletButton>
      ) : (
        <WalletInfo>
          <p>Connected Account: {account}</p>
          <p>Balance: {balance} ETH</p>
          <WalletButton onClick={disconnectWallet}>Disconnect Wallet</WalletButton>
        </WalletInfo>
      )}
    </div>
  );
}
