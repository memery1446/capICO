// src/App.js
import React, { useState, useEffect } from 'react';
import web3Service from './services/web3';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [icoStatus, setIcoStatus] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const connected = await web3Service.init();
      setIsConnected(connected);
      if (connected) {
        await updateStatus();
      }
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err.message);
    }
  };

  const updateStatus = async () => {
    try {
      const status = await web3Service.getICOStatus();
      setIcoStatus(status);
      
      const address = await web3Service.getAddress();
      const balance = await web3Service.getTokenBalance(address);
      setUserBalance(balance);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message);
    }
  };

  const connectWallet = async () => {
    await initializeApp();
  };

  if (!isConnected) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={connectWallet}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>ICO Status</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {icoStatus && (
        <div>
          <p>Total Raised: {icoStatus.totalRaised} ETH</p>
          <p>Hard Cap: {icoStatus.hardCap} ETH</p>
          <p>Token Price: {icoStatus.tokenPrice} ETH</p>
          <p>Active: {icoStatus.isActive ? 'Yes' : 'No'}</p>
          <p>Your Balance: {userBalance} DEMO</p>
        </div>
      )}
    </div>
  );
}

export default App;

