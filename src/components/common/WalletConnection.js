import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import web3Service from '../../services/web3Service';

const WalletConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await web3Service.getAddress();
      setIsConnected(true);
      updateAddress();
    } catch (error) {
      setIsConnected(false);
    }
  };

  const updateAddress = async () => {
    const addr = await web3Service.getAddress();
    setAddress(addr.slice(0, 6) + '...' + addr.slice(-4));
  };

  const handleConnect = async () => {
    try {
      await web3Service.init();
      setIsConnected(true);
      updateAddress();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await web3Service.disconnect();
      setIsConnected(false);
      setAddress('');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <div>
      {isConnected ? (
        <div>
          <span>{address}</span>
          <Button onClick={handleDisconnect} variant="outlined" color="secondary">
            Disconnect
          </Button>
        </div>
      ) : (
        <Button onClick={handleConnect} variant="contained" color="primary">
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default WalletConnection;



