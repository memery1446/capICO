// src/components/WalletConnection.js
import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import web3Service from '../services/web3';

const WalletConnection = ({ isConnected, onConnect }) => {
  const [address, setAddress] = useState('');

  const connectWallet = async () => {
    try {
      await web3Service.init();
      const userAddress = await web3Service.getAddress();
      setAddress(userAddress);
      if (onConnect) onConnect();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <Box textAlign="center" my={3}>
      {isConnected ? (
        <Typography>
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </Typography>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={connectWallet}
        >
          Connect Wallet
        </Button>
      )}
    </Box>
  );
};

export default WalletConnection;

