// src/components/core/ConnectionTest.js
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Not Connected');
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          setStatus('MetaMask not found');
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        setChainId(network.chainId);

        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setStatus('Connected');
        }
      } catch (error) {
        console.error('Connection error:', error);
        setStatus(`Error: ${error.message}`);
      }
    };

    init();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Blockchain Connection Test</h2>
      <div>Status: {status}</div>
      {account && <div>Account: {account}</div>}
      {chainId && <div>Chain ID: {chainId}</div>}
    </div>
  );
};

export default ConnectionTest;

