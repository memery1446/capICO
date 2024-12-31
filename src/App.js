import React, { useState, useEffect } from 'react';
import web3Service from './services/web3Service';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [icoStatus, setIcoStatus] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [error, setError] = useState(null);

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
        setError(err.message || 'An unknown error occurred');
      }
    };

    initializeWeb3();
    const interval = setInterval(updateICOInfo, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const updateICOInfo = async () => {
    try {
      const status = await web3Service.getICOStatus();
      setIcoStatus(status);
      const address = await web3Service.signer.getAddress();
      const balance = await web3Service.getTokenBalance(address);
      setUserBalance(balance);
    } catch (err) {
      console.error('Error updating ICO info:', err);
      setError(err.message || 'An error occurred while updating ICO information');
    }
  };

  const handleContribute = async () => {
    try {
      setError(null); // Clear any previous errors
      if (!icoStatus.isActive) {
        throw new Error('ICO is not active');
      }
      await web3Service.buyTokens(contributionAmount);
      setContributionAmount('');
      await updateICOInfo();
    } catch (err) {
      console.error('Error contributing:', err);
      setError(err.message || 'An error occurred while contributing. Please check the console for more details.');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="App">
      <h1>ICO DApp</h1>
      {error ? (
        <div>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : isConnected ? (
        <div>
          <p>Connected to Hardhat node</p>
          <h2>ICO Status</h2>
          {icoStatus && (
            <div>
              <p>Total Raised: {icoStatus.totalRaised} ETH</p>
              <p>Soft Cap: {icoStatus.softCap} ETH</p>
              <p>Hard Cap: {icoStatus.hardCap} ETH</p>
              <p>Token Price: {icoStatus.tokenPrice} ETH</p>
              <p>Start Time: {formatDate(icoStatus.startTime)}</p>
              <p>End Time: {formatDate(icoStatus.endTime)}</p>
              <p>Current Time: {formatDate(icoStatus.currentTime)}</p>
              <p>ICO Active: {icoStatus.isActive ? 'Yes' : 'No'}</p>
              <p>Finalized: {icoStatus.isFinalized ? 'Yes' : 'No'}</p>
            </div>
          )}
          <h2>Your Information</h2>
          <p>Your Token Balance: {userBalance} Tokens</p>
          <input 
            type="number" 
            value={contributionAmount} 
            onChange={(e) => setContributionAmount(e.target.value)} 
            placeholder="Contribution amount (ETH)"
          />
          <button onClick={handleContribute} disabled={!icoStatus || !icoStatus.isActive}>
            {!icoStatus || !icoStatus.isActive ? 'ICO Not Active' : 'Buy Tokens'}
          </button>
        </div>
      ) : (
        <p>Connecting to Hardhat node...</p>
      )}
    </div>
  );
}

export default App;

