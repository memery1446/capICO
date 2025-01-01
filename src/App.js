// src/App.js
import React, { useState, useEffect } from 'react';
import web3Service from './services/web3';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import WalletConnection from './components/WalletConnection';
import ICOStatus from './components/ICOStatus';
import BuyTokens from './components/BuyTokens';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [icoData, setIcoData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [userBalance, setUserBalance] = useState('0');

  const updateAppData = async () => {
    try {
      const [status, owner, balance] = await Promise.all([
        web3Service.getICOStatus(),
        web3Service.isOwner(),
        web3Service.getTokenBalance(await web3Service.getAddress())
      ]);
      
      setIcoData(status);
      setIsOwner(owner);
      setUserBalance(balance);
      setError(null);
    } catch (err) {
      console.error('Error updating app data:', err);
      setError(err.message);
    }
  };

  const initializeApp = async () => {
    try {
      const connected = await web3Service.init();
      setIsConnected(connected);
      if (connected) {
        await updateAppData();
      }
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" gutterBottom align="center">
          Demo ICO
        </Typography>

        <WalletConnection 
          isConnected={isConnected} 
          onConnect={initializeApp}
        />

        {error && (
          <Typography color="error" align="center" my={2}>
            {error}
          </Typography>
        )}

        {isConnected && (
          <>
            <ICOStatus 
              icoData={icoData} 
              userBalance={userBalance}
            />
            
            <BuyTokens 
              onPurchase={updateAppData}
              disabled={!icoData?.isActive}
            />
          </>
        )}
      </Box>
    </Container>
  );
}

export default App;