import React, { useState, useEffect } from 'react';
import web3Service from './services/web3Service';
import BuyTokensForm from './components/ico/BuyTokensForm';
import WalletConnection from './components/common/WalletConnection';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [icoStatus, setIcoStatus] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const initialized = await web3Service.init();
        setIsConnected(initialized);
        if (initialized) {
          await updateICOInfo();
        }
      } catch (err) {
        console.error('Error initializing web3:', err);
        setError(err.message || 'An unknown error occurred while initializing');
      }
    };

    initializeWeb3();
    const interval = setInterval(updateICOInfo, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updateICOInfo = async () => {
    try {
      const status = await web3Service.getICOStatus();
      setIcoStatus(status);
      const address = await web3Service.signer.getAddress();
      const balance = await web3Service.getTokenBalance(address);
      setUserBalance(balance);

      if (!status.hasStarted) {
        const timeLeft = status.startTime - status.currentTime;
        setCountdown(formatCountdown(timeLeft));
      } else {
        setCountdown(null);
      }
      setError(null); // Clear any previous errors if successful
    } catch (err) {
      console.error('Error updating ICO info:', err);
      setError(err.message || 'An error occurred while updating ICO information');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <h1>ICO DApp</h1>
      <WalletConnection isConnected={isConnected} setIsConnected={setIsConnected} />
      {error ? (
        <div>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : isConnected ? (
        <div>
          <p>Connected to Hardhat node</p>
          <h2>ICO Status</h2>
          {icoStatus ? (
            <div>
              <p>Total Raised: {icoStatus.totalRaised} ETH</p>
              <p>Soft Cap: {icoStatus.softCap} ETH</p>
              <p>Hard Cap: {icoStatus.hardCap} ETH</p>
              <p>Token Price: {icoStatus.tokenPrice} ETH</p>
              <p>Start Time: {formatDate(icoStatus.startTime)}</p>
              <p>End Time: {formatDate(icoStatus.endTime)}</p>
              <p>Current Time: {formatDate(icoStatus.currentTime)}</p>
              {countdown && <p>ICO starts in: {countdown}</p>}
              <p>ICO Active: {icoStatus.isActive ? 'Yes' : 'No'}</p>
              <p>Finalized: {icoStatus.isFinalized ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <p>Loading ICO status...</p>
          )}
          <h2>Your Information</h2>
          <p>Your Token Balance: {userBalance || 'Loading...'} Tokens</p>
          <BuyTokensForm isWalletConnected={isConnected} />
        </div>
      ) : (
        <p>Please connect your wallet to interact with the ICO</p>
      )}
    </div>
  );
}

export default App;

