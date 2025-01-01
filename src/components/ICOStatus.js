// src/components/ICOStatus.js
import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import web3Service from '../services/web3';

const ICOStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const icoStatus = await web3Service.getICOStatus();
        setStatus(icoStatus);
        setError(null);
      } catch (err) {
        console.error('Error fetching ICO status:', err);
        setError('Error fetching ICO status');
      } finally {
        setLoading(false);
      }
    };

    const checkWhitelist = async () => {
      try {
        const address = await web3Service.getAddress();
        const isWhitelisted = await web3Service.contracts.ico.whitelist(address);
        console.log('Whitelist status:', { address, isWhitelisted });
      } catch (err) {
        console.error('Error checking whitelist:', err);
      }
    };

    // Execute both functions
    fetchStatus();
    checkWhitelist();

    // Set up interval for status updates
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Typography>Loading ICO status...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!status) return null;

  const progress = (parseFloat(status.totalRaised) / parseFloat(status.hardCap)) * 100;

  return (
    <Card sx={{ mt: 3, mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>ICO Status</Typography>
        
        <Box my={2}>
          <Typography variant="subtitle1" gutterBottom>
            Progress: {status.totalRaised} / {status.hardCap} ETH
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(progress, 100)} 
            sx={{ height: 10, borderRadius: 1 }}
          />
        </Box>

        <Typography>Token Price: {status.tokenPrice} ETH</Typography>
        <Typography>
          Status: {status.isActive ? (
            <span style={{ color: 'green' }}>Active</span>
          ) : (
            <span style={{ color: 'red' }}>Inactive</span>
          )}
        </Typography>
        <Typography>
          Time: {new Date(status.startTime * 1000).toLocaleString()} - {new Date(status.endTime * 1000).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ICOStatus;

