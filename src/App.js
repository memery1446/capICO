import React, { useState, useEffect } from 'react';
import web3Service from './services/web3Service';
import BuyTokensForm from './components/ico/BuyTokensForm';
import WalletConnection from './components/common/WalletConnection';
import WhitelistManager from './components/admin/WhitelistManager';
import { Typography, Box, CircularProgress } from '@mui/material';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [icoStatus, setIcoStatus] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const initialized = await web3Service.init();
        setIsConnected(initialized);
        if (initialized) {
          await updateAppInfo();
        }
      } catch (err) {
        console.error('Error initializing app:', err);
        setError(err.message || 'An unknown error occurred while initializing');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
    const interval = setInterval(updateAppInfo, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const updateAppInfo = async () => {
    try {
      const status = await web3Service.getDetailedICOStatus();
      setIcoStatus(status);
      const address = await web3Service.getAddress();
      const balance = await web3Service.getTokenBalance(address);
      setUserBalance(balance);
      const ownerStatus = await web3Service.isOwner();
      setIsOwner(ownerStatus);
      setError(null);
    } catch (err) {
      console.error('Error updating app info:', err);
      setError(err.message || 'An error occurred while updating information');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box className="App" p={3}>
      <Typography variant="h4" gutterBottom>ICO DApp</Typography>
      <WalletConnection isConnected={isConnected} setIsConnected={setIsConnected} />
      {error ? (
        <Typography color="error" mt={2}>{error}</Typography>
      ) : isConnected ? (
        <Box mt={3}>
          <Typography variant="h5" gutterBottom>ICO Status</Typography>
          {icoStatus ? (
            <Box>
              <Typography>Total Raised: {icoStatus.totalRaised} ETH</Typography>
              <Typography>Soft Cap: {icoStatus.softCap} ETH</Typography>
              <Typography>Hard Cap: {icoStatus.hardCap} ETH</Typography>
              <Typography>Token Price: {icoStatus.tokenPrice} ETH</Typography>
              <Typography>Start Time: {formatDate(icoStatus.startTime)}</Typography>
              <Typography>End Time: {formatDate(icoStatus.endTime)}</Typography>
              <Typography>ICO Active: {icoStatus.isActive ? 'Yes' : 'No'}</Typography>
              <Typography>Finalized: {icoStatus.isFinalized ? 'Yes' : 'No'}</Typography>
              <Typography>Your Whitelist Status: {icoStatus.isCurrentUserWhitelisted ? 'Whitelisted' : 'Not Whitelisted'}</Typography>
            </Box>
          ) : (
            <Typography>Loading ICO status...</Typography>
          )}
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>Your Information</Typography>
            <Typography>Your Token Balance: {userBalance || 'Loading...'} Tokens</Typography>
          </Box>
          <Box mt={3}>
            <BuyTokensForm isWalletConnected={isConnected} />
          </Box>
          {isOwner && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>Admin Panel</Typography>
              <WhitelistManager />
            </Box>
          )}
        </Box>
      ) : (
        <Typography mt={2}>Please connect your wallet to interact with the ICO</Typography>
      )}
    </Box>
  );
}

export default App;

