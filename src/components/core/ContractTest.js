// src/components/core/ContractTest.js
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import TokenArtifact from '../../artifacts/contracts/Token.sol/Token.json';

const CONTRACT_ADDRESSES = {
  TOKEN: "0x5fbdb2315678afecb367f032d93f642f64180aa3"
};

const ContractTest = () => {
  const [status, setStatus] = useState('Initializing...');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [currentBlock, setCurrentBlock] = useState(null);

  // Keep track of Hardhat provider
  const [hardhatProvider] = useState(
    new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
  );

  const connectWallet = async (blockNumber) => {
    try {
      if (!window.ethereum) return false;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Get balances at specific block
      const balance = await provider.getBalance(address, blockNumber);
      
      // Use hardhat provider for token balance to ensure consistency
      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TOKEN,
        TokenArtifact.abi,
        hardhatProvider
      );
      
      const tokenBalance = await tokenContract.balanceOf(address, { blockTag: blockNumber });

      setWalletInfo({
        address,
        balance: ethers.utils.formatEther(balance),
        tokenBalance: ethers.utils.formatEther(tokenBalance)
      });

      return true;
    } catch (err) {
      console.error('Wallet error:', err);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Get current block
        const blockNumber = await hardhatProvider.getBlockNumber();
        setCurrentBlock(blockNumber);
        setStatus(`At block ${blockNumber}`);

        // Initialize token contract
        const tokenContract = new ethers.Contract(
          CONTRACT_ADDRESSES.TOKEN,
          TokenArtifact.abi,
          hardhatProvider
        );

        // Get token info at current block
        const [name, symbol, totalSupply] = await Promise.all([
          tokenContract.name({ blockTag: blockNumber }),
          tokenContract.symbol({ blockTag: blockNumber }),
          tokenContract.totalSupply({ blockTag: blockNumber })
        ]);

        setTokenInfo({
          name,
          symbol,
          totalSupply: ethers.utils.formatEther(totalSupply)
        });

        // Try initial wallet connection
        if (window.ethereum) {
          const connected = await connectWallet(blockNumber);
          if (connected) {
            setStatus(`Connected at block ${blockNumber}`);
          }
        }

      } catch (err) {
        console.error('Init error:', err);
        setStatus(`Error: ${err.message}`);
      }
    };

    init();

    // Set up block listener
    const blockListener = (blockNumber) => {
      setCurrentBlock(blockNumber);
      setStatus(`New block: ${blockNumber}`);
    };

    hardhatProvider.on('block', blockListener);

    return () => {
      hardhatProvider.off('block', blockListener);
    };
  }, [hardhatProvider]);

  const handleManualConnect = async () => {
    try {
      setStatus('Connecting wallet...');
      const blockNumber = await hardhatProvider.getBlockNumber();
      const success = await connectWallet(blockNumber);
      setStatus(success ? 'Wallet connected' : 'Connection failed');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="p-4 border rounded-lg bg-white">
        <h2 className="text-xl mb-4">Status</h2>
        <div className="space-y-2">
          <div>Status: {status}</div>
          <div>Block: {currentBlock}</div>
          {!walletInfo && (
            <button 
              onClick={handleManualConnect}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {tokenInfo && (
        <div className="p-4 border rounded-lg bg-white">
          <h2 className="text-xl mb-4">Token Info</h2>
          <div className="space-y-2">
            <div>Name: {tokenInfo.name}</div>
            <div>Symbol: {tokenInfo.symbol}</div>
            <div>Total Supply: {tokenInfo.totalSupply}</div>
          </div>
        </div>
      )}

      {walletInfo && (
        <div className="p-4 border rounded-lg bg-white">
          <h2 className="text-xl mb-4">Wallet Info</h2>
          <div className="space-y-2">
            <div>Address: {walletInfo.address}</div>
            <div>ETH Balance: {walletInfo.balance}</div>
            <div>Token Balance: {walletInfo.tokenBalance}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractTest;

